"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tent } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="header-logo">
          <span className="header-logo-icon" style={{ display: "flex", alignItems: "center" }}><Tent size={24} /></span>
          <span className="gradient-text">EventHub</span>
        </Link>

        <nav className="header-nav">
          <Link
            href="/events"
            className={`header-nav-link ${isActive("/events") ? "active" : ""}`}
          >
            Events
          </Link>
        </nav>

        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => alert("Registrierung & Login sind in dieser Vorschau deaktiviert.")}>
            Anmelden
          </button>
          <button className="btn btn-primary" onClick={() => alert("Registrierung & Login sind in dieser Vorschau deaktiviert.")}>
            Registrieren
          </button>
        </div>
      </div>
    </header>
  );
}
