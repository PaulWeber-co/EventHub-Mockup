"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatPrice, formatDate, formatDateShort, categoryLabels, categoryIcons,
  getCapacityStatus, getCapacityPercent, statusLabels,
} from "@/lib/utils";
import { 
  Frown, PartyPopper, AlertTriangle, Tent, Calendar, 
  MapPin, User, BarChart, Clock, XCircle, 
  CreditCard, Wallet, Landmark, Ticket 
} from "lucide-react";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [event, setEvent] = useState<any>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data.event);
        setAvgRating(data.avgRating);
      })
      .catch(() => setError("Event nicht gefunden"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleBook = async () => {
    setBooking(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: params.id,
          ticketCount,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setBooking(false);
        return;
      }

      setBookingResult(data.booking);
      // Update local event data
      setEvent((prev: any) => ({
        ...prev,
        ticketsSold: prev.ticketsSold + ticketCount,
      }));
    } catch {
      setError("Buchung fehlgeschlagen");
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: params.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh event data
        const eventRes = await fetch(`/api/events/${params.id}`);
        const eventData = await eventRes.json();
        setEvent(eventData.event);
        setAvgRating(eventData.avgRating);
        setReviewComment("");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Bewertung fehlgeschlagen");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: "60vh" }}>
        <span className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container page-content">
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center", color: "var(--text-muted)" }}><Frown size={48} /></div>
          <h3 className="empty-state-title">Event nicht gefunden</h3>
          <Link href="/events" className="btn btn-primary">Zurück zu Events</Link>
        </div>
      </div>
    );
  }

  const capacity = getCapacityStatus(event.ticketsSold, event.capacity);
  const percent = getCapacityPercent(event.ticketsSold, event.capacity);
  const remaining = event.capacity - event.ticketsSold;
  const isPast = new Date(event.startDate) < new Date();
  const isOrganizer = user?.id === event.organizerId;
  const canBook = session && !isOrganizer && !isPast && remaining > 0 && event.status === "PUBLISHED";
  const hasBooked = event.bookings?.some?.((b: any) => b.userId === user?.id && b.status === "CONFIRMED");

  // Booking success view
  if (bookingResult) {
    return (
      <div className="container">
        <div className="confirmation animate-fade-in">
          <div className="confirmation-icon" style={{ display: "flex", justifyContent: "center", color: "var(--accent-primary)" }}><PartyPopper size={48} /></div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Buchung bestätigt!
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Deine Tickets für <strong>{event.title}</strong> sind reserviert.
          </p>
          <div className="confirmation-code">{bookingResult.confirmationCode}</div>
          <div style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {ticketCount}x Ticket · {formatPrice(Number(bookingResult.totalPrice))}
          </div>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href={`/bookings/${bookingResult.id}`} className="btn btn-primary">
              Buchung ansehen
            </Link>
            <Link href="/events" className="btn btn-secondary">
              Weitere Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content animate-fade-in">
      {/* Header Image */}
      <div className="event-detail-header">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="event-detail-image" />
        )}
        <div className="event-detail-overlay">
          {(() => {
            const CategoryIcon = categoryIcons[event.category] || categoryIcons.OTHER;
            return (
              <span className="badge badge-primary" style={{ marginBottom: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <CategoryIcon size={14} /> {categoryLabels[event.category]}
              </span>
            );
          })()}
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.2 }}>
            {event.title}
          </h1>
          {avgRating && (
            <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="review-stars">
                {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
              </span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {avgRating.toFixed(1)} ({event.reviews?.length || 0} Bewertungen)
              </span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><AlertTriangle size={16} /> {error}</div>}

      <div className="event-detail-grid">
        {/* Main Content */}
        <div className="event-detail-info">
          {/* Organizer Actions */}
          {isOrganizer && (
            <div className="alert alert-info" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Tent size={16} /> Du bist der Veranstalter dieses Events.
              <Link href={`/events/${params.id}/edit`} className="btn btn-sm btn-secondary" style={{ marginLeft: "auto" }}>
                Bearbeiten
              </Link>
            </div>
          )}

          {/* Event Details */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Veranstaltungsdetails
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="event-info-row">
                  <div className="event-info-icon"><Calendar size={20} /></div>
                  <div>
                    <div className="event-info-label">Datum & Uhrzeit</div>
                    <div className="event-info-value">{formatDate(event.startDate)}</div>
                  </div>
                </div>
                <div className="event-info-row">
                  <div className="event-info-icon"><MapPin size={20} /></div>
                  <div>
                    <div className="event-info-label">Veranstaltungsort</div>
                    <div className="event-info-value">{event.location}</div>
                    {event.locationAddress && (
                      <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        {event.locationAddress}
                      </div>
                    )}
                  </div>
                </div>
                <div className="event-info-row">
                  <div className="event-info-icon"><User size={20} /></div>
                  <div>
                    <div className="event-info-label">Veranstalter</div>
                    <div className="event-info-value">{event.organizer?.name}</div>
                  </div>
                </div>
                <div className="event-info-row">
                  <div className="event-info-icon"><BarChart size={20} /></div>
                  <div>
                    <div className="event-info-label">Auslastung</div>
                    <div className="event-info-value">
                      {event.ticketsSold} / {event.capacity} Tickets verkauft
                    </div>
                    <div style={{ marginTop: "0.5rem", maxWidth: "200px" }}>
                      <div className="capacity-bar">
                        <div
                          className={`capacity-bar-fill ${capacity.variant}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className={`capacity-text ${capacity.variant}`}>
                        {capacity.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                Beschreibung
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {event.description}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                Bewertungen {event.reviews?.length > 0 && `(${event.reviews.length})`}
              </h2>

              {event.reviews?.length > 0 ? (
                <div>
                  {event.reviews.map((review: any) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-avatar">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{review.user.name}</div>
                          <div className="review-stars">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <div className="review-date" style={{ marginLeft: "auto" }}>
                          {formatDateShort(review.createdAt)}
                        </div>
                      </div>
                      {review.comment && <p className="review-text">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)" }}>Noch keine Bewertungen</p>
              )}

              {/* Review Form */}
              {session && isPast && !isOrganizer && (
                <form onSubmit={handleReview} style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                    Deine Bewertung
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Sterne</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            color: star <= reviewRating ? "var(--warning)" : "var(--text-muted)",
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kommentar (optional)</label>
                    <textarea
                      className="form-input form-textarea"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Wie hat dir das Event gefallen?"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? "Wird gesendet..." : "Bewertung abgeben"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar – Booking */}
        <div className="event-detail-sidebar">
          <div className="booking-card">
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="booking-card-price">
                {formatPrice(Number(event.price))}
              </div>
              <div className="booking-card-price-label">pro Ticket</div>
            </div>

            {isPast ? (
              <div className="alert alert-warning" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={16} /> Dieses Event hat bereits stattgefunden
              </div>
            ) : capacity.variant === "sold-out" ? (
              <div className="alert alert-error" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <XCircle size={16} /> Dieses Event ist ausverkauft
              </div>
            ) : !session ? (
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                  Melde dich an, um Tickets zu buchen
                </p>
                <Link href={`/login?callbackUrl=/events/${params.id}`} className="btn btn-primary btn-lg w-full">
                  Anmelden zum Buchen
                </Link>
              </div>
            ) : isOrganizer ? (
              <div className="alert alert-info" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Tent size={16} /> Du bist der Veranstalter
              </div>
            ) : (
              <>
                {/* Ticket Counter */}
                <div className="form-group">
                  <label className="form-label">Anzahl Tickets</label>
                  <div className="ticket-counter">
                    <button
                      className="ticket-counter-btn"
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      disabled={ticketCount <= 1}
                    >
                      −
                    </button>
                    <span className="ticket-counter-value">{ticketCount}</span>
                    <button
                      className="ticket-counter-btn"
                      onClick={() => setTicketCount(Math.min(remaining, ticketCount + 1))}
                      disabled={ticketCount >= remaining}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label className="form-label">Zahlungsmethode</label>
                  <div className="payment-methods">
                    {[
                      { value: "CREDIT_CARD", icon: <CreditCard size={20} />, name: "Kreditkarte", desc: "Visa, Mastercard" },
                      { value: "PAYPAL", icon: <Wallet size={20} />, name: "PayPal", desc: "Schnell & sicher" },
                      { value: "BANK_TRANSFER", icon: <Landmark size={20} />, name: "Überweisung", desc: "Banküberweisung" },
                    ].map((method) => (
                      <div
                        key={method.value}
                        className={`payment-method ${paymentMethod === method.value ? "selected" : ""}`}
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        <span className="payment-method-icon">{method.icon}</span>
                        <div>
                          <div className="payment-method-name">{method.name}</div>
                          <div className="payment-method-desc">{method.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem 0",
                    borderTop: "1px solid var(--border)",
                    marginTop: "1rem",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                  }}
                >
                  <span>Gesamt</span>
                  <span className="gradient-text">
                    {formatPrice(Number(event.price) * ticketCount)}
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-lg w-full"
                  onClick={handleBook}
                  disabled={booking}
                  style={{ marginTop: "0.5rem" }}
                >
                  {booking ? (
                    <><span className="spinner" /> Wird gebucht...</>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}><Ticket size={18} /> {ticketCount} Ticket{ticketCount > 1 ? "s" : ""} buchen</span>
                  )}
                </button>

                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.75rem" }}>
                  Simulierte Zahlung – kein echtes Geld wird abgebucht
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
