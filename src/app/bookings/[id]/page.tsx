"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate, bookingStatusLabels, paymentStatusLabels, categoryLabels, categoryIcons } from "@/lib/utils";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${params.id}`)
      .then((r) => r.json())
      .then((data) => setBooking(data.booking))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="loading-overlay" style={{ minHeight: "60vh" }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!booking) return <div className="container page-content"><div className="alert alert-error">Buchung nicht gefunden</div></div>;

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { PENDING: "badge-warning", CONFIRMED: "badge-success", CANCELLED: "badge-error", REFUNDED: "badge-info", COMPLETED: "badge-success", FAILED: "badge-error" };
    return m[s] || "badge-primary";
  };

  return (
    <div className="container page-content" style={{ maxWidth: "700px" }}>
      <div className="page-header" style={{ border: "none" }}>
        <Link href="/bookings" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>← Zurück zu Buchungen</Link>
        <h1 className="page-title mt-md">Buchungsdetails</h1>
      </div>

      {/* Ticket Card */}
      <div className="card animate-fade-in" style={{ marginBottom: "1.5rem" }}>
        <div style={{ background: "var(--accent-gradient)", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Confirmation Code</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.15em", marginTop: "0.25rem" }}>
            {booking.confirmationCode}
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.25rem" }}>{booking.event?.title}</h2>
            <span className={`badge ${statusBadge(booking.status)}`}>
              {bookingStatusLabels[booking.status]}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Datum</div>
              <div style={{ fontWeight: 600 }}>{formatDate(booking.event?.startDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Ort</div>
              <div style={{ fontWeight: 600 }}>{booking.event?.location}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Tickets</div>
              <div style={{ fontWeight: 600 }}>{booking.ticketCount}x</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Gesamtpreis</div>
              <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{formatPrice(Number(booking.totalPrice))}</div>
            </div>
          </div>

          {booking.event?.organizer && (
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Veranstalter: </span>
              <strong>{booking.event.organizer.name}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Payment Info */}
      {booking.payment && (
        <div className="card animate-fade-in">
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Zahlungsinformationen</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Status</div>
                <span className={`badge ${statusBadge(booking.payment.status)}`}>
                  {paymentStatusLabels[booking.payment.status]}
                </span>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Betrag</div>
                <div style={{ fontWeight: 600 }}>{formatPrice(Number(booking.payment.amount))}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Methode</div>
                <div style={{ fontWeight: 600 }}>
                  {booking.payment.method === "CREDIT_CARD" ? "💳 Kreditkarte" :
                   booking.payment.method === "PAYPAL" ? "🅿️ PayPal" : "🏦 Überweisung"}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Transaktions-ID</div>
                <code style={{ fontSize: "0.75rem" }}>{booking.payment.transactionId}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
