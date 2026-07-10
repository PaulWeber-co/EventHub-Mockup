"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "CONCERT", label: "🎵 Konzert" },
  { value: "WORKSHOP", label: "🔧 Workshop" },
  { value: "FESTIVAL", label: "🎪 Festival" },
  { value: "LECTURE", label: "🎤 Vortrag" },
  { value: "SPORTS", label: "⚽ Sport" },
  { value: "COMMUNITY", label: "🏘️ Vereinsfest" },
  { value: "OTHER", label: "📌 Sonstiges" },
];

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((data) => setEvent(data.event))
      .catch(() => setError("Event nicht gefunden"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          startDate: formData.get("startDate"),
          endDate: formData.get("endDate"),
          location: formData.get("location"),
          locationAddress: formData.get("locationAddress"),
          category: formData.get("category"),
          price: formData.get("price"),
          capacity: formData.get("capacity"),
          imageUrl: formData.get("imageUrl"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Speichern fehlgeschlagen");
        setSaving(false);
        return;
      }
      router.push(`/events/${params.id}`);
    } catch {
      setError("Fehler beim Speichern");
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (status === "CANCELLED" && !confirm("Event wirklich absagen? Alle Besucher werden benachrichtigt.")) return;

    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch {}
  };

  if (loading) return <div className="loading-overlay" style={{ minHeight: "60vh" }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!event) return <div className="container page-content"><div className="alert alert-error">Event nicht gefunden</div></div>;

  const formatForInput = (date: string) => new Date(date).toISOString().slice(0, 16);

  return (
    <div className="container page-content" style={{ maxWidth: "760px" }}>
      <div className="page-header" style={{ border: "none" }}>
        <h1 className="page-title">Event <span className="gradient-text">bearbeiten</span></h1>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          {event.status === "DRAFT" && (
            <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange("PUBLISHED")}>
              🚀 Veröffentlichen
            </button>
          )}
          {event.status === "PUBLISHED" && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange("DRAFT")}>
                📝 Zurückziehen
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange("CANCELLED")}>
                ❌ Absagen
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Titel</label>
              <input name="title" type="text" className="form-input" defaultValue={event.title} required />
            </div>
            <div className="form-group">
              <label className="form-label">Beschreibung</label>
              <textarea name="description" className="form-input form-textarea" defaultValue={event.description} required style={{ minHeight: "150px" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Beginn</label>
                <input name="startDate" type="datetime-local" className="form-input" defaultValue={formatForInput(event.startDate)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Ende</label>
                <input name="endDate" type="datetime-local" className="form-input" defaultValue={formatForInput(event.endDate)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Veranstaltungsort</label>
              <input name="location" type="text" className="form-input" defaultValue={event.location} required />
            </div>
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input name="locationAddress" type="text" className="form-input" defaultValue={event.locationAddress || ""} />
            </div>
            <div className="form-group">
              <label className="form-label">Kategorie</label>
              <select name="category" className="form-input form-select" defaultValue={event.category}>
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Preis (€)</label>
                <input name="price" type="number" step="0.01" min="0" className="form-input" defaultValue={Number(event.price)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Kapazität (min. {event.ticketsSold})</label>
                <input name="capacity" type="number" min={event.ticketsSold || 1} className="form-input" defaultValue={event.capacity} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bild-URL</label>
              <input name="imageUrl" type="url" className="form-input" defaultValue={event.imageUrl || ""} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? "Speichern..." : "💾 Änderungen speichern"}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => router.back()}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
