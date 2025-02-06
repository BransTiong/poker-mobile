import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../hooks/supabase';
import GameEngine from '../game/engine/GameEngine';

export function CreateBotGame() {
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a new game in the database
      const { data: gameData, error: gameError } = await supabase
        .from('Game')
        .insert([{
          createdById: user.id,
          gameType: 'TEXAS_HOLDEM',
          isPrivate: true,
          buyIn: 1000,
          minPlayers: 2,
          maxPlayers: 5,
          smallBlind: 10,
          bigBlind: 20,
          status: 'WAITING'
        }])
        .select()
        .single();

      if (gameError) throw gameError;

      // Add the creator as a participant
      const { error: participantError } = await supabase
        .from('GameParticipant')
        .insert([{
          gameId: gameData.id,
          userId: user.id,
          position: 0,
          stack: 1000,
          status: 'ACTIVE'
        }]);

      if (participantError) throw participantError;

      // Navigate to the game page
      router.push({
        pathname: "/game/[id]",
        params: { id: gameData.id }
      });

    } catch (error: any) {
      console.error('Error creating game:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateGame}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Game...' : 'Play vs Bots'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});