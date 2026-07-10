"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Tent, Bell, CheckCircle, Clock, XCircle, CircleDollarSign } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as any;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  useEffect(() => {
    if (session) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="header-logo">
          <span className="header-logo-icon" style={{ display: "flex", alignItems: "center" }}><Tent size={24} /></span>
          <span className="gradient-text">EventHub</span>
        </Link>

        <nav className="header-nav">
          <Link
            href="/events"
            className={`header-nav-link ${isActive("/events") ? "active" : ""}`}
          >
            Events
          </Link>
          {user?.role === "ORGANIZER" || user?.role === "ADMIN" ? (
            <>
              <Link
                href="/events/create"
                className={`header-nav-link ${isActive("/events/create") ? "active" : ""}`}
              >
                Event erstellen
              </Link>
              <Link
                href="/dashboard"
                className={`header-nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                Dashboard
              </Link>
            </>
          ) : null}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`header-nav-link ${isActive("/admin") ? "active" : ""}`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {session ? (
            <>
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  className="header-notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Benachrichtigungen"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-dot" />}
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                      <strong>Benachrichtigungen</strong>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                        Keine Benachrichtigungen
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${!n.isRead ? "unread" : ""}`}
                          onClick={() => !n.isRead && markAsRead(n.id)}
                          style={{ cursor: !n.isRead ? "pointer" : "default" }}
                        >
                          <div
                            className="notification-icon"
                            style={{
                              background: n.type === "BOOKING_CONFIRMED"
                                ? "var(--success-bg)"
                                : n.type === "EVENT_REMINDER"
                                ? "var(--info-bg)"
                                : "var(--warning-bg)",
                            }}
                          >
                            {n.type === "BOOKING_CONFIRMED"
                              ? <CheckCircle size={16} />
                              : n.type === "EVENT_REMINDER"
                              ? <Clock size={16} />
                              : n.type === "EVENT_CANCELLED"
                              ? <XCircle size={16} />
                              : <CircleDollarSign size={16} />}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-message">{n.message}</div>
                            <div className="notification-time">
                              {new Date(n.createdAt).toLocaleDateString("de-DE")}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Link href="/bookings" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
                Meine Buchungen
              </Link>
              <div
                className="header-user"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Abmelden"
              >
                <div className="header-user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  {user?.name?.split(" ")[0]}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Anmelden
              </Link>
              <Link href="/register" className="btn btn-primary">
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
