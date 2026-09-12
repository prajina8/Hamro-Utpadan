import { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import { getSocket } from "../api/socket.js";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = async () => {
    const { data } = await api.get("/notifications");
    setNotifications(data.notifications);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (notif) => setNotifications((prev) => [notif, ...prev]);
    socket.on("notification", handleNew);
    return () => socket.off("notification", handleNew);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notif-wrap" ref={panelRef}>
      <button className="notif-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="btn-quiet" style={{ padding: "2px 8px", fontSize: "0.72rem" }} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <div className="notif-item">Nothing yet - updates on stock will land here.</div>
          )}
          {notifications.map((n) => (
            <div key={n._id} className={`notif-item ${n.read ? "" : "unread"}`}>
              <div>{n.message}</div>
              <div className="notif-time">{timeAgo(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
