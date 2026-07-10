import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <span style={{ fontWeight: 600 }}>🎪 EventHub</span>{" "}
          <span>© {new Date().getFullYear()} RheinMain Veranstaltungsgenossenschaft eG</span>
        </div>
        <div className="footer-links">
          <Link href="/events" className="footer-link">Events</Link>
          <span className="footer-link" style={{ cursor: "default" }}>Datenschutz</span>
          <span className="footer-link" style={{ cursor: "default" }}>Impressum</span>
          <span className="footer-link" style={{ cursor: "default" }}>AGB</span>
        </div>
      </div>
    </footer>
  );
}
