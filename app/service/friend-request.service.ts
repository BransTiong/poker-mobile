import { supabase } from '../hooks/supabase';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  sender: {
    username: string;
    avatarUrl?: string | null;
  };
}

export class FriendRequestService {
  /**
   * Send a friend request to another user
   */
  static async sendRequest(senderId: string, receiverUsername: string): Promise<void> {
    try {
      // First, find the receiver by username
      const { data: receiver, error: receiverError } = await supabase
        .from('User')
        .select('id')
        .eq('username', receiverUsername)
        .single();

      if (receiverError || !receiver) throw new Error('User not found');
      if (receiver.id === senderId) throw new Error('Cannot send friend request to yourself');

      // Check if they are already friends by checking the Friend table
      const { data: existingFriendship, error: friendError } = await supabase
        .from('Friend')
        .select()
        .match({
          userId: senderId,
          friendId: receiver.id
        })
        .maybeSingle();

      if (existingFriendship) {
        throw new Error('You are already friends with this user');
      }

      // Check for existing requests (any status)
      const { data: existingRequest, error: requestError } = await supabase
        .from('FriendRequest')
        .select('id, status, senderId')
        .or(`and(senderId.eq.${senderId},receiverId.eq.${receiver.id}),and(senderId.eq.${receiver.id},receiverId.eq.${senderId})`)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          if (existingRequest.senderId === senderId) {
            throw new Error('You already sent a friend request to this user');
          } else {
            throw new Error('This user has already sent you a friend request');
          }
        } else if (existingRequest.status === 'DECLINED') {
          // Update the declined request to pending
          const { error: updateError } = await supabase
            .from('FriendRequest')
            .update({
              status: 'PENDING',
              senderId: senderId,
              receiverId: receiver.id,
              updatedAt: new Date().toISOString()
            })
            .eq('id', existingRequest.id);

          if (updateError) throw updateError;
          return;
        }
      }

      // Create new friend request if no existing request found
      const { error: insertError } = await supabase
        .from('FriendRequest')
        .insert({
          senderId: senderId,
          receiverId: receiver.id,
          status: 'PENDING'
        });

      if (insertError) throw insertError;
    } catch (error: any) {
      console.error('Error sending friend request:', error.message);
      throw error;
    }
  }

  /**
   * Get pending friend requests for a user
   */
  static async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data: requests, error } = await supabase
        .from('FriendRequest')
        .select(`
          id,
          senderId,
          receiverId,
          status,
          sender:User!senderId (
            username,
            avatarUrl
          )
        `)
        .eq('receiverId', userId)
        .eq('status', 'PENDING')
        .returns<FriendRequest[]>();

      if (error) throw error;
      return requests || [];
    } catch (error: any) {
      console.error('Error fetching friend requests:', error.message);
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  static async acceptRequest(requestId: string): Promise<void> {
    try {
      const { data: request, error: fetchError } = await supabase
        .from('FriendRequest')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update request status
      const { error: updateError } = await supabase
        .from('FriendRequest')
        .update({ status: 'ACCEPTED' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create friendship for both users
      const { error: friendError } = await supabase
        .from('Friend')
        .insert([
          {
            userId: request.senderId,
            friendId: request.receiverId
          },
          {
            userId: request.receiverId,
            friendId: request.senderId
          }
        ]);

      if (friendError) throw friendError;
    } catch (error: any) {
      console.error('Error accepting friend request:', error.message);
      throw error;
    }
  }

  /**
   * Decline a friend request
   */
  static async declineRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('FriendRequest')
        .update({ status: 'DECLINED' })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error declining friend request:', error.message);
      throw error;
    }
  }
}