import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FriendRequest } from '../service/friend-request.service';

interface PendingRequestsProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function PendingRequests({ requests, onAccept, onDecline }: PendingRequestsProps) {
  if (requests.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.sender.username}</Text>
              <Text style={styles.subtitle}>wants to be your friend</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]}
                onPress={() => onAccept(item.id)}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.declineButton]}
                onPress={() => onDecline(item.id)}
              >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#242424',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#9e9e9e',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});