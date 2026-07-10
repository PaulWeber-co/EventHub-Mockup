"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate, statusLabels, getCapacityPercent, getCapacityStatus } from "@/lib/utils";
import { BarChart, Ticket } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay" style={{ minHeight: "60vh" }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!data?.stats) return <div className="container page-content"><div className="alert alert-error">Dashboard nicht verfügbar</div></div>;

  const { stats, events, recentBookings, eventStats } = data;

  return (
    <div className="container page-content">
      <div className="page-header" style={{ border: "none" }}>
        <h1 className="page-title">Veranstalter <span className="gradient-text">Dashboard</span></h1>
        <p className="page-description">Überblick über deine Veranstaltungen und Verkäufe</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-xl animate-fade-in">
        <div className="stat-card">
          <div className="stat-card-label">Veranstaltungen</div>
          <div className="stat-card-value">{stats.totalEvents}</div>
          <div className="stat-card-change positive">{stats.publishedEvents} veröffentlicht</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Buchungen</div>
          <div className="stat-card-value">{stats.totalBookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Tickets verkauft</div>
          <div className="stat-card-value">{stats.totalTicketsSold}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Umsatz (gesamt)</div>
          <div className="stat-card-value gradient-text">{formatPrice(stats.totalRevenue)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Event Capacity */}
        <div className="card" style={{ cursor: "default" }}>
          <div className="card-body">
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart size={18} /> Auslastung
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {eventStats?.map((evt: any) => {
                const cap = getCapacityStatus(evt.ticketsSold, evt.capacity);
                const pct = getCapacityPercent(evt.ticketsSold, evt.capacity);
                return (
                  <div key={evt.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                      <Link href={`/events/${evt.id}`} style={{ fontWeight: 600 }}>{evt.title}</Link>
                      <span style={{ color: "var(--text-muted)" }}>{evt.ticketsSold}/{evt.capacity}</span>
                    </div>
                    <div className="capacity-bar" style={{ height: "6px" }}>
                      <div className={`capacity-bar-fill ${cap.variant}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!eventStats || eventStats.length === 0) && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Keine veröffentlichten Events</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ cursor: "default" }}>
          <div className="card-body">
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Ticket size={18} /> Letzte Buchungen
            </h2>
            {recentBookings?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentBookings.slice(0, 8).map((b: any) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{b.event?.title} · {b.ticketCount}x</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600 }}>{formatPrice(Number(b.totalPrice))}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{formatDate(b.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Keine Buchungen vorhanden</p>
            )}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="mt-xl">
        <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "1rem" }}>Deine Veranstaltungen</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Tickets</th>
                <th>Umsatz</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events?.map((evt: any) => (
                <tr key={evt.id}>
                  <td style={{ fontWeight: 600 }}>{evt.title}</td>
                  <td>
                    <span className={`badge ${evt.status === "PUBLISHED" ? "badge-success" : evt.status === "DRAFT" ? "badge-warning" : evt.status === "CANCELLED" ? "badge-error" : "badge-info"}`}>
                      {statusLabels[evt.status]}
                    </span>
                  </td>
                  <td>{formatDate(evt.startDate)}</td>
                  <td>{evt.ticketsSold}/{evt.capacity}</td>
                  <td>{formatPrice(Number(evt.price) * evt.ticketsSold)}</td>
                  <td>
                    <Link href={`/events/${evt.id}/edit`} className="btn btn-ghost btn-sm">Bearbeiten</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
