/** Format a price in EUR */
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

/** Format a date in German locale */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Format just the date without time */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Generate a unique confirmation code */
export function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Generate a fake transaction ID */
export function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/** Calculate capacity percentage */
export function getCapacityPercent(ticketsSold: number, capacity: number): number {
  if (capacity === 0) return 100;
  return Math.round((ticketsSold / capacity) * 100);
}

/** Get capacity status label */
export function getCapacityStatus(ticketsSold: number, capacity: number): {
  label: string;
  color: string;
  variant: "available" | "low" | "critical" | "sold-out";
} {
  const remaining = capacity - ticketsSold;
  const percent = getCapacityPercent(ticketsSold, capacity);

  if (remaining <= 0) {
    return { label: "Ausverkauft", color: "#ef4444", variant: "sold-out" };
  }
  if (percent >= 90) {
    return { label: `Nur noch ${remaining} Plätze!`, color: "#f59e0b", variant: "critical" };
  }
  if (percent >= 70) {
    return { label: "Fast ausverkauft", color: "#f97316", variant: "low" };
  }
  return { label: `${remaining} Plätze verfügbar`, color: "#10b981", variant: "available" };
}

/** Category display names */
export const categoryLabels: Record<string, string> = {
  CONCERT: "Konzert",
  WORKSHOP: "Workshop",
  FESTIVAL: "Festival",
  LECTURE: "Vortrag",
  SPORTS: "Sport",
  COMMUNITY: "Vereinsfest",
  OTHER: "Sonstiges",
};

import { Music, Wrench, Tent, Mic, Trophy, Users, Pin } from "lucide-react";

/** Category icons (lucide-react) */
export const categoryIcons: Record<string, any> = {
  CONCERT: Music,
  WORKSHOP: Wrench,
  FESTIVAL: Tent,
  LECTURE: Mic,
  SPORTS: Trophy,
  COMMUNITY: Users,
  OTHER: Pin,
};

/** Status display names */
export const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  CANCELLED: "Abgesagt",
  COMPLETED: "Abgeschlossen",
};

/** Booking status labels */
export const bookingStatusLabels: Record<string, string> = {
  PENDING: "Ausstehend",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
  REFUNDED: "Erstattet",
};

/** Payment status labels */
export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Ausstehend",
  COMPLETED: "Bezahlt",
  FAILED: "Fehlgeschlagen",
  REFUNDED: "Erstattet",
};
