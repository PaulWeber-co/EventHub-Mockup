import Link from "next/link";
import { Search, Ticket, PartyPopper, Calendar, MapPin, User } from "lucide-react";
import { getEvents } from "@/lib/data";
import { categoryLabels, categoryIcons, formatPrice, formatDate, getCapacityStatus, getCapacityPercent } from "@/lib/utils";

export default async function HomePage() {
  const allEvents = await getEvents();
  const featuredEvents = allEvents.slice(0, 6);

  const stats = {
    events: allEvents.length,
    bookings: 420,
    users: 1337,
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1>
            Entdecke <span className="gradient-text">Events</span> in deiner Region
          </h1>
          <p>
            Finde Konzerte, Workshops, Festivals und mehr in der RheinMain-Region.
            Buche sicher online und erlebe unvergessliche Momente.
          </p>
          <div className="hero-actions">
            <Link href="/events" className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Search className="w-5 h-5" /> Events entdecken
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Kostenlos registrieren
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{stats.events}+</div>
              <div className="hero-stat-label">Veranstaltungen</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{stats.bookings}+</div>
              <div className="hero-stat-label">Buchungen</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{stats.users}+</div>
              <div className="hero-stat-label">Nutzer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div className="text-center mb-xl">
          <h2 className="section-title">
            Kommende <span className="gradient-text">Highlights</span>
          </h2>
          <p className="section-subtitle">Die nächsten Events, die du nicht verpassen solltest</p>
        </div>

        <div className="grid grid-cols-3 stagger">
          {featuredEvents.map((event) => {
            const capacity = getCapacityStatus(event.ticketsSold, event.capacity);
            const percent = getCapacityPercent(event.ticketsSold, event.capacity);
            const CategoryIcon = categoryIcons[event.category];
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article className="event-card">
                  <div className="event-card-image-wrapper">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="event-card-image"
                      />
                    )}
                    <span className="event-card-badge">
                      <span className="badge badge-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <CategoryIcon size={14} /> {categoryLabels[event.category]}
                      </span>
                    </span>
                    <span className="event-card-price">
                      {formatPrice(Number(event.price))}
                    </span>
                  </div>
                  <div className="event-card-content">
                    <div className="event-card-title">{event.title}</div>
                    <div className="event-card-meta">
                      <div className="event-card-meta-item">
                        <span className="event-card-meta-icon"><Calendar size={14} /></span>
                        {formatDate(event.startDate)}
                      </div>
                      <div className="event-card-meta-item">
                        <span className="event-card-meta-icon"><MapPin size={14} /></span>
                        {event.location}
                      </div>
                      <div className="event-card-meta-item">
                        <span className="event-card-meta-icon"><User size={14} /></span>
                        {event.organizer.name}
                      </div>
                    </div>
                  </div>
                  <div className="event-card-footer">
                    <div style={{ flex: 1 }}>
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
                </article>
              </Link>
            );
          })}
        </div>

        {featuredEvents.length > 0 && (
          <div className="text-center mt-2xl">
            <Link href="/events" className="btn btn-secondary btn-lg">
              Alle Events anzeigen →
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section style={{ background: "var(--bg-secondary)", padding: "5rem 0" }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="section-title">So funktioniert <span className="gradient-text">EventHub</span></h2>
          </div>
          <div className="grid grid-cols-3 stagger">
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ color: "var(--accent-primary)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><Search size={48} /></div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Entdecken</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Durchsuche hunderte regionale Veranstaltungen nach Kategorie, Datum und Ort.
              </p>
            </div>
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ color: "var(--accent-primary)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><Ticket size={48} /></div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Buchen</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Sichere dir Tickets für deine Lieblings-Events – einfach, schnell und sicher.
              </p>
            </div>
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ color: "var(--accent-primary)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><PartyPopper size={48} /></div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Erleben</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Erlebe unvergessliche Momente und teile deine Erfahrungen mit der Community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
