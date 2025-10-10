import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Messaging = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('connections')
          .select('*, connected_user:connected_user_id(*)')
          .eq('user_id', user.id);
        if (error) {
          console.error('Error fetching connections:', error);
        } else {
          setConnections(data);
        }
      }
    };
    fetchConnections();
  }, [user]);

  useEffect(() => {
    if (selectedConnection) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConnection.connected_user.id}),and(sender_id.eq.${selectedConnection.connected_user.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data);
        }
      };
      fetchMessages();

      const subscription = supabase
        .channel(`messages:sender_id-${user.id}-receiver_id-${selectedConnection.connected_user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            setMessages((prevMessages) => [...prevMessages, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedConnection, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConnection) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: selectedConnection.connected_user.id,
        content: newMessage,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <h2 className="text-lg font-semibold p-4">Connections</h2>
        <ul>
          {connections.map((connection) => (
            <li
              key={connection.id}
              className={`p-4 cursor-pointer ${selectedConnection?.id === connection.id ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedConnection(connection)}
            >
              {connection.connected_user.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 flex flex-col">
        {selectedConnection ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedConnection.connected_user.name}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`p-2 rounded-lg max-w-xs ${message.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded-l-lg p-2"
                  placeholder="Type a message..."
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg">
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a connection to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
