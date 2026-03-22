import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Utensils, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! I am your Food Guide AI. Ask me about famous foods or restaurants nearby!' }
  ]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          lat: userLocation?.[0],
          lng: userLocation?.[1]
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    "What is the most famous street food here?",
    "Best dosa near me",
    "Top desserts in this area"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-500 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-widest">Food Guide AI</div>
                  <div className="text-[10px] opacity-80">Online & Ready to Help</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-white rounded-tr-none' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="p-4 pt-0 flex flex-wrap gap-2">
                {quickSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setMessage(s); }}
                    className="text-[10px] font-bold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors border border-transparent hover:border-emerald-500/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  placeholder="Ask about food..."
                  className="flex-1 bg-transparent outline-none text-sm px-2 text-zinc-900 dark:text-white"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || loading}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rotate-90' : 'bg-emerald-500 text-white hover:scale-110'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
