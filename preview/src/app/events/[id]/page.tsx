import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getEvents } from "@/lib/data";
import {
  formatPrice, formatDate, categoryLabels, categoryIcons,
  getCapacityStatus, getCapacityPercent,
} from "@/lib/utils";
import { 
  PartyPopper, Tent, Calendar, 
  MapPin, User, BarChart, Clock, XCircle, Ticket 
} from "lucide-react";

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  const capacity = getCapacityStatus(event.ticketsSold, event.capacity);
  const percent = getCapacityPercent(event.ticketsSold, event.capacity);
  const isPast = new Date(event.startDate!) < new Date();

  return (
    <div className="container page-content animate-fade-in">
      {/* Header Image */}
      <div className="event-detail-header">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="event-detail-image" />
        )}
        <div className="event-detail-overlay">
          {(() => {
            const CategoryIcon = categoryIcons[event.category as keyof typeof categoryIcons] || categoryIcons.OTHER;
            return (
              <span className="badge badge-primary" style={{ marginBottom: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <CategoryIcon size={14} /> {categoryLabels[event.category as keyof typeof categoryLabels]}
              </span>
            );
          })()}
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.2 }}>
            {event.title}
          </h1>
        </div>
      </div>

      <div className="event-detail-grid">
        {/* Main Content */}
        <div className="event-detail-info">
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
                    <div className="event-info-value">{formatDate(new Date(event.startDate))}</div>
                  </div>
                </div>
                <div className="event-info-row">
                  <div className="event-info-icon"><MapPin size={20} /></div>
                  <div>
                    <div className="event-info-label">Veranstaltungsort</div>
                    <div className="event-info-value">{event.location}</div>
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
            ) : (
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                  Die Buchungsfunktion ist in dieser statischen Vorschau deaktiviert.
                </p>
                <button className="btn btn-primary btn-lg w-full" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}><Ticket size={18} /> Buchen deaktiviert</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
