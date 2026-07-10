"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const categories = [
  { value: "CONCERT", label: "🎵 Konzert" },
  { value: "WORKSHOP", label: "🔧 Workshop" },
  { value: "FESTIVAL", label: "🎪 Festival" },
  { value: "LECTURE", label: "🎤 Vortrag" },
  { value: "SPORTS", label: "⚽ Sport" },
  { value: "COMMUNITY", label: "🏘️ Vereinsfest" },
  { value: "OTHER", label: "📌 Sonstiges" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const status = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-status") || "DRAFT";

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          startDate: formData.get("startDate"),
          endDate: formData.get("endDate") || formData.get("startDate"),
          location: formData.get("location"),
          locationAddress: formData.get("locationAddress"),
          category: formData.get("category"),
          price: formData.get("price"),
          capacity: formData.get("capacity"),
          imageUrl: formData.get("imageUrl"),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erstellen fehlgeschlagen");
        setLoading(false);
        return;
      }

      router.push(`/events/${data.event.id}`);
    } catch {
      setError("Ein Fehler ist aufgetreten");
      setLoading(false);
    }
  };

  return (
    <div className="container page-content" style={{ maxWidth: "760px" }}>
      <div className="page-header" style={{ border: "none" }}>
        <h1 className="page-title">
          Event <span className="gradient-text">erstellen</span>
        </h1>
        <p className="page-description">
          Erstelle eine neue Veranstaltung für die RheinMain-Region
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Titel *</label>
              <input
                id="title" name="title" type="text" className="form-input"
                placeholder="Name deiner Veranstaltung" required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Beschreibung *</label>
              <textarea
                id="description" name="description" className="form-input form-textarea"
                placeholder="Beschreibe deine Veranstaltung ausführlich..." required
                style={{ minHeight: "150px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Beginn *</label>
                <input
                  id="startDate" name="startDate" type="datetime-local"
                  className="form-input" required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="endDate">Ende</label>
                <input
                  id="endDate" name="endDate" type="datetime-local" className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Veranstaltungsort *</label>
              <input
                id="location" name="location" type="text" className="form-input"
                placeholder="z.B. Stadthalle Wiesbaden" required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="locationAddress">Adresse</label>
              <input
                id="locationAddress" name="locationAddress" type="text" className="form-input"
                placeholder="Straße, PLZ Ort"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Kategorie *</label>
              <select id="category" name="category" className="form-input form-select" required>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="price">Preis (€) *</label>
                <input
                  id="price" name="price" type="number" step="0.01" min="0"
                  className="form-input" placeholder="0.00" required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="capacity">Kapazität *</label>
                <input
                  id="capacity" name="capacity" type="number" min="1"
                  className="form-input" placeholder="100" required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="imageUrl">Bild-URL</label>
              <input
                id="imageUrl" name="imageUrl" type="url" className="form-input"
                placeholder="https://example.com/event-bild.jpg"
              />
              <div className="form-hint">
                Tipp: Nutze Unsplash für kostenlose Bilder (z.B. https://images.unsplash.com/photo-...)
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                data-status="PUBLISHED"
                disabled={loading}
              >
                {loading ? "Wird erstellt..." : "🚀 Veröffentlichen"}
              </button>
              <button
                type="submit"
                className="btn btn-secondary btn-lg"
                data-status="DRAFT"
                disabled={loading}
              >
                💾 Als Entwurf speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
