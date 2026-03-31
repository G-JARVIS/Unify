import { useState } from "react";
import { MessageSquare, Send, Search } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  company: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: "1", name: "eshheet raka", company: "BuildTech Industries", lastMessage: "Can we discuss the supply chain proposal?", time: "2m ago", unread: 2, avatar: "ER",
    messages: [
      { id: "1", text: "Hi! We saw your profile on UNIFY and were impressed by your capabilities.", sender: "them", time: "10:30 AM" },
      { id: "2", text: "Thank you, eshheet! We'd love to collaborate. What's the project scope?", sender: "me", time: "10:32 AM" },
      { id: "3", text: "We need IT infrastructure support for our new construction project. Budget is around ₹50L.", sender: "them", time: "10:35 AM" },
      { id: "4", text: "Can we discuss the supply chain proposal?", sender: "them", time: "10:40 AM" },
    ],
  },
  {
    id: "2", name: "gandharva ugale", company: "AgriTech Corp", lastMessage: "The collaboration agreement looks good!", time: "1h ago", unread: 0, avatar: "GU",
    messages: [
      { id: "1", text: "Hi, I wanted to follow up on the agricultural digitization project.", sender: "me", time: "9:00 AM" },
      { id: "2", text: "Sure! We've reviewed your proposal and it looks promising.", sender: "them", time: "9:15 AM" },
      { id: "3", text: "The collaboration agreement looks good!", sender: "them", time: "9:20 AM" },
    ],
  },
  {
    id: "3", name: "farhaan khan", company: "SolarPlus Ltd", lastMessage: "When can we schedule a call?", time: "3h ago", unread: 1, avatar: "FK",
    messages: [
      { id: "1", text: "We're interested in your IoT solutions for our solar farms.", sender: "them", time: "Yesterday" },
      { id: "2", text: "That sounds great! We have extensive experience in that area.", sender: "me", time: "Yesterday" },
      { id: "3", text: "When can we schedule a call?", sender: "them", time: "Today" },
    ],
  },
  {
    id: "4", name: "mihika chandra", company: "HealthBridge AI", lastMessage: "Looking forward to the consortium meeting.", time: "1d ago", unread: 0, avatar: "MC",
    messages: [
      { id: "1", text: "Welcome to the telemedicine consortium!", sender: "them", time: "2 days ago" },
      { id: "2", text: "Thanks for having us. We're excited to contribute.", sender: "me", time: "2 days ago" },
      { id: "3", text: "Looking forward to the consortium meeting.", sender: "them", time: "Yesterday" },
    ],
  },
];

const Messages = () => {
  const [activeConv, setActiveConv] = useState<string>(conversations[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [convs, setConvs] = useState(conversations);
  const [searchQuery, setSearchQuery] = useState("");

  const active = convs.find((c) => c.id === activeConv)!;
  const filtered = convs.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const updated = convs.map((c) =>
      c.id === activeConv
        ? { ...c, messages: [...c.messages, { id: Date.now().toString(), text: newMessage, sender: "me" as const, time: "Just now" }], lastMessage: newMessage, time: "Just now" }
        : c
    );
    setConvs(updated);
    setNewMessage("");
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in h-[calc(100vh-7rem)]">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Messages</h1>
      <div className="glass-card rounded-xl flex h-[calc(100%-3rem)] overflow-hidden">
        {/* Conversation List */}
        <div className="w-80 border-r border-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${activeConv === conv.id ? "bg-muted/70" : ""}`}
              >
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-primary-foreground">{conv.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{conv.name}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{conv.company}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="text-[10px] font-bold gradient-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{conv.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary-foreground">{active.avatar}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{active.name}</p>
              <p className="text-[11px] text-muted-foreground">{active.company}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {active.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-3.5 py-2.5 rounded-xl text-sm ${msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 h-10 px-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleSend} className="h-10 px-4 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
