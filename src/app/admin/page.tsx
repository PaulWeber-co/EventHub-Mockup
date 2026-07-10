"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch {
      alert("Fehler beim Ändern der Rolle");
    }
  };

  if (loading) return <div className="loading-overlay" style={{ minHeight: "60vh" }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const roleBadge = (role: string) => {
    const m: Record<string, string> = { ADMIN: "badge-error", ORGANIZER: "badge-primary", VISITOR: "badge-success" };
    return m[role] || "badge-primary";
  };

  const roleLabel: Record<string, string> = { ADMIN: "Admin", ORGANIZER: "Veranstalter", VISITOR: "Besucher" };

  return (
    <div className="container page-content">
      <div className="page-header" style={{ border: "none" }}>
        <h1 className="page-title">Admin <span className="gradient-text">Panel</span></h1>
        <p className="page-description">Nutzerverwaltung und Moderation</p>
      </div>

      <div className="stats-grid mb-xl animate-fade-in">
        <div className="stat-card">
          <div className="stat-card-label">Gesamtnutzer</div>
          <div className="stat-card-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Veranstalter</div>
          <div className="stat-card-value">{users.filter((u) => u.role === "ORGANIZER").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Besucher</div>
          <div className="stat-card-value">{users.filter((u) => u.role === "VISITOR").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Admins</div>
          <div className="stat-card-value">{users.filter((u) => u.role === "ADMIN").length}</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Registriert</th>
              <th>Events</th>
              <th>Buchungen</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                <td>
                  <span className={`badge ${roleBadge(user.role)}`}>{roleLabel[user.role]}</span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user._count?.organizedEvents || 0}</td>
                <td>{user._count?.bookings || 0}</td>
                <td>
                  <select
                    className="form-input form-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={{ width: "auto", padding: "0.25rem 2rem 0.25rem 0.5rem", fontSize: "0.75rem" }}
                  >
                    <option value="VISITOR">Besucher</option>
                    <option value="ORGANIZER">Veranstalter</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
