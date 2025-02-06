import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FriendItemProps {
  friend: {
    id: string;
    username: string;
    status?: string;
    lastSeen?: string | null;
  };
  onPress: () => void;
  onDelete: () => void;
}

export function FriendItem({ friend, onPress, onDelete }: FriendItemProps) {
  const handleDelete = () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {friend.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.username}>{friend.username}</Text>
          <Text style={[styles.status, friend.status === 'online' ? styles.online : styles.offline]}>
            {friend.status === 'online' ? 'Online' : friend.lastSeen || 'Offline'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <MaterialIcons name="person-remove" size={24} color="#f44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#242424',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
  },
  online: {
    color: '#4CAF50',
  },
  offline: {
    color: '#9e9e9e',
  },
  deleteButton: {
    padding: 8,
  },
});