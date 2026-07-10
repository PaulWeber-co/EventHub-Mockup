"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categoryLabels, categoryIcons, formatPrice, formatDate, getCapacityStatus, getCapacityPercent } from "@/lib/utils";

const categories = [
  { value: "ALL", label: "Alle Kategorien", icon: "🎯" },
  { value: "CONCERT", label: "Konzert", icon: "🎵" },
  { value: "WORKSHOP", label: "Workshop", icon: "🔧" },
  { value: "FESTIVAL", label: "Festival", icon: "🎪" },
  { value: "LECTURE", label: "Vortrag", icon: "🎤" },
  { value: "SPORTS", label: "Sport", icon: "⚽" },
  { value: "COMMUNITY", label: "Vereinsfest", icon: "🏘️" },
  { value: "OTHER", label: "Sonstiges", icon: "📌" },
];

const dateFilters = [
  { value: "", label: "Alle Termine" },
  { value: "today", label: "Heute" },
  { value: "week", label: "Diese Woche" },
  { value: "month", label: "Diesen Monat" },
  { value: "upcoming", label: "Bevorstehend" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("upcoming");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchEvents = async (params: { search: string; category: string; date: string }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.category !== "ALL") query.set("category", params.category);
      if (params.date) query.set("date", params.date);
      query.set("limit", "24");

      const res = await fetch(`/api/events?${query}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents({ search, category, date: dateFilter });
  }, [category, dateFilter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchEvents({ search: value, category, date: dateFilter });
    }, 300);
    setSearchTimeout(timeout);
  };

  return (
    <div className="container page-content">
      <div className="page-header" style={{ border: "none", paddingBottom: 0 }}>
        <h1 className="page-title">
          Events <span className="gradient-text">entdecken</span>
        </h1>
        <p className="page-description">
          Finde spannende Veranstaltungen in der RheinMain-Region
        </p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Events suchen..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="filter-group mb-lg">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`filter-chip ${category === cat.value ? "active" : ""}`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Date Filters */}
      <div className="filter-group mb-xl">
        {dateFilters.map((df) => (
          <button
            key={df.value}
            className={`filter-chip ${dateFilter === df.value ? "active" : ""}`}
            onClick={() => setDateFilter(df.value)}
          >
            {df.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-overlay">
          <span className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">Keine Events gefunden</h3>
          <p className="empty-state-text">
            Versuche andere Suchbegriffe oder Filter.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setCategory("ALL");
              setDateFilter("");
              fetchEvents({ search: "", category: "ALL", date: "" });
            }}
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 stagger">
          {events.map((event) => {
            const capacity = getCapacityStatus(event.ticketsSold, event.capacity);
            const percent = getCapacityPercent(event.ticketsSold, event.capacity);
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
                      <span className="badge badge-primary">
                        {categoryIcons[event.category]} {categoryLabels[event.category]}
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
                        <span className="event-card-meta-icon">📅</span>
                        {formatDate(event.startDate)}
                      </div>
                      <div className="event-card-meta-item">
                        <span className="event-card-meta-icon">📍</span>
                        {event.location}
                      </div>
                      {event.organizer && (
                        <div className="event-card-meta-item">
                          <span className="event-card-meta-icon">👤</span>
                          {event.organizer.name}
                        </div>
                      )}
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
      )}
    </div>
  );
}
