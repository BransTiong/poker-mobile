import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../hooks/supabase';
import { FriendsService, Friend } from '../../service/friends.service';
import { FriendRequestService, FriendRequest } from '../../service/friend-request.service';
import React from 'react';
import { PendingRequests } from '../../components/PendingRequests';
import { FriendItem } from '../../components/FriendItem';
import { router } from 'expo-router';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch both friends and pending requests
      const [friendsList, requestsList] = await Promise.all([
        FriendsService.getFriends(user.id),
        FriendRequestService.getPendingRequests(user.id)
      ]);

      setFriends(friendsList);
      setPendingRequests(requestsList);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      Alert.alert('Error', 'Failed to load friends and requests');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await FriendRequestService.sendRequest(user.id, searchQuery.trim());
      Alert.alert('Success', `Friend request sent to ${searchQuery}`);
      setSearchQuery('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await FriendRequestService.acceptRequest(requestId);
      Alert.alert('Success', 'Friend request accepted');
      fetchData(); // Refresh the lists
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await FriendRequestService.declineRequest(requestId);
      Alert.alert('Success', 'Friend request declined');
      fetchData(); // Refresh the lists
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleViewProfile = (friendId: string) => {
    router.push({
      pathname: "/(app)/profile/[id]",
      params: { id: friendId }
    });
  };

  const handleRemoveFriend = async (friendId: string, friendUsername: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await FriendsService.removeFriend(user.id, friendId);
      setFriends(friends.filter(friend => friend.id !== friendId));
      Alert.alert('Success', `Removed ${friendUsername} from friends`);
    } catch (error: any) {
      console.error('Error removing friend:', error.message);
      Alert.alert('Error', 'Failed to remove friend');
    }
  };

  const isOnline = (lastSeen: Date) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#9e9e9e" />
          <TextInput
            style={styles.searchInput}
            placeholder="Add friend by username..."
            placeholderTextColor="#9e9e9e"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={sendFriendRequest}
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={sendFriendRequest}
          >
            <MaterialIcons name="person-add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <PendingRequests
          requests={pendingRequests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <>
            <View style={styles.friendsContainer}>
              <Text style={styles.sectionTitle}>Friends</Text>
              <FlatList
                data={friends}
                renderItem={({ item }) => (
                  <FriendItem
                    friend={item}
                    onPress={() => handleViewProfile(item.id)}
                    onDelete={() => handleRemoveFriend(item.id, item.username)}
                  />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyText}>No friends added yet</Text>
                )}
              />
            </View>
          </>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    padding: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  friendCard: {
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
    marginBottom: 4,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  requestsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    marginBottom: 8,
  },
  requestInfo: {
    flex: 1,
  },
  requestText: {
    color: '#9e9e9e',
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  friendsContainer: {
    marginTop: 20,
  },
});