import * as Crypto from 'expo-crypto';
import { supabase } from '../hooks/supabase';

export interface Friend {
  id: string;
  username: string;
  avatarUrl?: string | null;
  status?: 'online' | 'offline';
  lastSeen?: string | null;
}

interface FriendResponse {
  friendId: string;
  friend: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export class FriendsService {
  /**
   * Get all friends for a user
   */
  static async getFriends(userId: string): Promise<Friend[]> {
    try {
      const { data: friends, error: friendsError } = await supabase
        .from('Friend')
        .select(`
          friendId,
          friend:User!friendId (
            id,
            username,
            avatarUrl
          )
        `)
        .eq('userId', userId) as { data: FriendResponse[] | null, error: any };

      if (friendsError) throw friendsError;

      return (friends || []).map(f => ({
        id: f.friend.id,
        username: f.friend.username,
        avatarUrl: f.friend.avatarUrl,
        status: 'offline',
        lastSeen: null
      }));
    } catch (error: any) {
      console.error('Error fetching friends:', error.message);
      throw new Error('Failed to fetch friends');
    }
  }

  /**
   * Add a new friend by username
   */
  static async addFriend(userId: string, friendUsername: string): Promise<void> {
    try {
      const { data: friendData, error: friendError } = await supabase
        .from('User')
        .select('id')
        .eq('username', friendUsername)
        .single();

      if (friendError) throw new Error('User not found');
      if (friendData.id === userId) throw new Error('Cannot add yourself');

      // Check existing friendship
      const { data: existingFriend, error: checkError } = await supabase
        .from('Friend')
        .select('id')
        .or(`and(userId.eq.${userId},friendId.eq.${friendData.id}),and(userId.eq.${friendData.id},friendId.eq.${userId})`)
        .single();

      if (existingFriend) throw new Error('Already friends');

      // Insert without specifying id or createdAt (let database defaults handle it)
      const { error: insertError } = await supabase
        .from('Friend')
        .insert({
          userId: userId,
          friendId: friendData.id
        });

      if (insertError) throw insertError;
    } catch (error: any) {
      console.error('Error adding friend:', error.message);
      throw error;
    }
  }

  /**
   * Remove a friend
   */
  static async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Delete the friendship entries
      const { error: friendError } = await supabase
        .from('Friend')
        .delete()
        .or(`and(userId.eq.${userId},friendId.eq.${friendId}),and(userId.eq.${friendId},friendId.eq.${userId})`);

      if (friendError) throw friendError;

      // Delete any friend request entries between these users
      const { error: requestError } = await supabase
        .from('FriendRequest')
        .delete()
        .or(`and(senderId.eq.${userId},receiverId.eq.${friendId}),and(senderId.eq.${friendId},receiverId.eq.${userId})`);

      if (requestError) throw requestError;
    } catch (error: any) {
      console.error('Error removing friend:', error.message);
      throw error;
    }
  }
}
