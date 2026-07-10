import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "EventHub – Regionale Veranstaltungen entdecken & buchen",
  description:
    "EventHub ist die digitale Plattform der RheinMain Veranstaltungsgenossenschaft. Entdecke Konzerte, Workshops, Festivals und mehr in deiner Region. Tickets sicher online buchen.",
  keywords: ["Events", "Veranstaltungen", "RheinMain", "Tickets", "Konzerte", "Workshops"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <Header />
          <main style={{ minHeight: "calc(100vh - 64px - 100px)" }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
