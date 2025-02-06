import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../hooks/supabase';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}