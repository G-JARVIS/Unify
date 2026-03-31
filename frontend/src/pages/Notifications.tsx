import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialNotifications = [
  { id: "1", title: "Application shortlisted", desc: "Your application for Smart City Infrastructure has been shortlisted.", time: "2 hours ago", read: false, link: "/applications" },
  { id: "2", title: "New supply chain request", desc: "BuildTech Industries posted a new procurement requirement.", time: "5 hours ago", read: false, link: "/supply-chain" },
  { id: "3", title: "AI Match Found", desc: "A new 90% match opportunity in FinTech sector is available.", time: "1 day ago", read: true, link: "/ai-recommendations" },
  { id: "4", title: "Collaboration invite", desc: "InnovateTech Solutions invited you to join a consortium.", time: "2 days ago", read: true, link: "/collaborations" },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleClick = (n: typeof initialNotifications[0]) => {
    setNotifications(notifications.map((notif) => notif.id === n.id ? { ...notif, read: true } : notif));
    navigate(n.link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`glass-card rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${!n.read ? "border-l-2 border-l-primary" : ""}`}
          >
            <div className={`p-2 rounded-lg ${!n.read ? "bg-primary/10" : "bg-muted"}`}>
              <Bell className={`h-4 w-4 ${!n.read ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
