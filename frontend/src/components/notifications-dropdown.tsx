"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<any>("/notifications");
      const notifs = data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Simple polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications.
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer flex flex-col items-start gap-1 ${
                  n.isRead ? "opacity-60" : "bg-muted/30"
                }`}
                onClick={() => !n.isRead && markAsRead(n.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">
                    {n.type.replace(/_/g, " ")}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {n.payload?.message || "You have a new update."}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
