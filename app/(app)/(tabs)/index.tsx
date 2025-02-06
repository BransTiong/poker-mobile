import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';

export default function LobbyPage() {
  const [games, setGames] = useState([
    { id: '1', type: 'Texas Hold\'em', buyIn: 1000, players: '5/9', blinds: '10/20' },
    { id: '2', type: 'Texas Hold\'em', buyIn: 500, players: '3/6', blinds: '5/10' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Poker Lobby</Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Game</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={games}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gameCard}>
              <Text style={styles.gameType}>{item.type}</Text>
              <View style={styles.gameDetails}>
                <Text style={styles.detailText}>Buy-in: ${item.buyIn}</Text>
                <Text style={styles.detailText}>Players: {item.players}</Text>
                <Text style={styles.detailText}>Blinds: {item.blinds}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16, // Add padding at the bottom of the list
  },
  gameCard: {
    backgroundColor: '#242424',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  gameType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    color: '#9e9e9e',
    fontSize: 14,
  },
});