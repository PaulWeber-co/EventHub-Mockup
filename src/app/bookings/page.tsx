"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  formatPrice, formatDate, categoryLabels, categoryIcons,
  bookingStatusLabels, paymentStatusLabels,
} from "@/lib/utils";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Buchung wirklich stornieren? Der Betrag wird erstattet.")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "CANCELLED", payment: { ...b.payment, status: "REFUNDED" } } : b
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Stornierung fehlgeschlagen");
      }
    } catch {
      alert("Fehler bei der Stornierung");
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: "60vh" }}>
        <span className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "badge-warning",
      CONFIRMED: "badge-success",
      CANCELLED: "badge-error",
      REFUNDED: "badge-info",
    };
    return map[status] || "badge-primary";
  };

  return (
    <div className="container page-content">
      <div className="page-header" style={{ border: "none" }}>
        <h1 className="page-title">
          Meine <span className="gradient-text">Buchungen</span>
        </h1>
        <p className="page-description">Übersicht deiner Tickets und Buchungshistorie</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3 className="empty-state-title">Noch keine Buchungen</h3>
          <p className="empty-state-text">
            Entdecke spannende Events und buche deine ersten Tickets!
          </p>
          <Link href="/events" className="btn btn-primary">Events entdecken</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="card" style={{ cursor: "default" }}>
              <div style={{ display: "flex", gap: "1.5rem", padding: "1.25rem" }}>
                {booking.event?.imageUrl && (
                  <img
                    src={booking.event.imageUrl}
                    alt={booking.event.title}
                    style={{
                      width: "160px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-lg)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <Link href={`/events/${booking.event?.id}`} style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                        {booking.event?.title}
                      </Link>
                      <div className="event-card-meta" style={{ marginTop: "0.5rem" }}>
                        <div className="event-card-meta-item">
                          <span className="event-card-meta-icon">📅</span>
                          {formatDate(booking.event?.startDate)}
                        </div>
                        <div className="event-card-meta-item">
                          <span className="event-card-meta-icon">📍</span>
                          {booking.event?.location}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${statusBadge(booking.status)}`}>
                      {bookingStatusLabels[booking.status]}
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", gap: "2rem", fontSize: "0.875rem" }}>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Tickets: </span>
                        <strong>{booking.ticketCount}x</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Gesamt: </span>
                        <strong>{formatPrice(Number(booking.totalPrice))}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Code: </span>
                        <code style={{ fontWeight: 700, color: "var(--accent-primary)" }}>
                          {booking.confirmationCode}
                        </code>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/bookings/${booking.id}`} className="btn btn-ghost btn-sm">
                        Details
                      </Link>
                      {booking.status === "CONFIRMED" && new Date(booking.event?.startDate) > new Date() && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Stornieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
