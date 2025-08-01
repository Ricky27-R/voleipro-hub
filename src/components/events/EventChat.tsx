import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventChatProps {
  eventId: string;
}

export const EventChat = ({ eventId }: EventChatProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ['event-chat', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .select(`
          *
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time effect
  });

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .insert({
          event_id: eventId,
          sender_id: user?.id,
          message: messageText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-chat', eventId] });
      setMessage('');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user?.id) {
      sendMessage.mutate(message.trim());
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages?.map(msg => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  Usuario {msg.sender_id?.slice(0, 8)}
                </span>
                <span>•</span>
                <span>
                  {format(new Date(msg.created_at), 'Pp', { locale: es })}
                </span>
              </div>
              <div className={`p-3 rounded-lg max-w-[80%] ${
                msg.sender_id === user?.id 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
          
          {(!messages || messages.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sendMessage.isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};