import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadStatus, setUnreadStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      if (user) {
        const { data: connections, error: connectionsError } = await supabase
          .from('connections')
          .select('id, connected_user_id')
          .eq('user_id', user.id);

        if (connectionsError) {
          console.error('Error fetching connections:', connectionsError);
          return;
        }

        const newUnreadStatus: {[key: string]: boolean} = {};
        for (const connection of connections) {
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from('messages')
            .select('created_at')
            .or(`(sender_id.eq.${user.id},receiver_id.eq.${connection.connected_user_id}),(sender_id.eq.${connection.connected_user_id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lastMessageError) {
            if (lastMessageError.code === 'PGRST116') {
              continue;
            }
            console.error('Error fetching last message:', lastMessageError);
            continue;
          }

          if (lastMessage) {
            const lastReadTimestamp = localStorage.getItem(`lastRead_${connection.id}`);
            if (!lastReadTimestamp || new Date(lastMessage.created_at) > new Date(lastReadTimestamp)) {
              newUnreadStatus[connection.id] = true;
            } else {
              newUnreadStatus[connection.id] = false;
            }
          }
        }
        setUnreadStatus(newUnreadStatus);
      }
    };

    fetchUnreadStatus();

    const subscription = supabase
      .channel('unread-messages-status')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchUnreadStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return unreadStatus;
};
