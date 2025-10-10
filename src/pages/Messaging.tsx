import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Badge } from '@/components/ui/badge';

const Messaging = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const unreadStatus = useUnreadMessages();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

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
          if (data && data.length > 0) {
            localStorage.setItem(`lastRead_${selectedConnection.id}`, data[data.length - 1].created_at);
          }
        }
      };
      fetchMessages();

      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
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

    const { data, error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: selectedConnection.connected_user.id,
        content: newMessage,
      },
    ]).select();

    if (error) {
      console.error('Error sending message:', error);
    } else {
      if (data) {
        setMessages((prevMessages) => [...prevMessages, data[0]]);
      }
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-200 bg-white shadow-md">
        <h2 className="text-xl font-semibold p-4 border-b border-gray-200">Connections</h2>
        <ul>
          {connections.map((connection) => (
            <li
              key={connection.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConnection?.id === connection.id ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedConnection(connection)}
            >
              <div className="flex items-center justify-between">
                <span>{connection.connected_user.name}</span>
                {unreadStatus[connection.id] && <Badge>New</Badge>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedConnection ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold">{selectedConnection.connected_user.name}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-cover bg-center" style={{backgroundImage: "url('/src/assets/hero-bg.jpg')"}}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex my-2 ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`p-3 rounded-2xl max-w-md shadow ${message.sender_id === user.id ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded-full py-3 px-5 focus:outline-none focus:border-blue-500"
                  placeholder="Type a message..."
                />
                <button type="submit" className="ml-4 bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "url('/src/assets/hero-bg.jpg')"}}>
            <p className="text-2xl text-white bg-black bg-opacity-50 p-4 rounded-lg">Select a connection to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
