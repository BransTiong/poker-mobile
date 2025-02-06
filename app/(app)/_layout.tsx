import { Redirect, Stack, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../hooks/supabase';
import { View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="profile/[id]" 
        options={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#ffffff',
          headerTitle: 'View Profile'
        }} 
      />
    </Stack>
  );
}