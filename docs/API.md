# API-Dokumentation

Alle API-Endpunkte sind als Next.js API Routes implementiert und unter `/api/` erreichbar.

## Authentifizierung

Die API verwendet JWT-basierte Sessions über NextAuth.js. Geschützte Endpunkte erfordern einen gültigen Session-Cookie.

---

## Endpunkte

### Auth

#### `POST /api/auth/register`

Neuen Nutzer registrieren.

**Request Body:**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.de",
  "password": "sicheres-passwort",
  "role": "VISITOR"
}
```

**Response `201`:**
```json
{
  "user": {
    "id": "uuid",
    "email": "max@example.de",
    "name": "Max Mustermann",
    "role": "VISITOR"
  }
}
```

**Fehler:**
- `400` – Pflichtfelder fehlen
- `409` – E-Mail bereits registriert

#### `POST /api/auth/signin`

Login über NextAuth Credentials Provider (Standard NextAuth Endpunkt).

---

### Events

#### `GET /api/events`

Veröffentlichte Events auflisten mit optionalen Filtern.

**Query Parameter:**
| Parameter | Typ | Beschreibung |
|---|---|---|
| `search` | string | Volltextsuche in Titel, Beschreibung, Ort |
| `category` | string | Filter nach Kategorie (CONCERT, WORKSHOP, etc.) |
| `date` | string | `today`, `week`, `month`, `upcoming` |
| `location` | string | Filter nach Ort |
| `page` | number | Seite (Default: 1) |
| `limit` | number | Ergebnisse pro Seite (Default: 12) |

**Response `200`:**
```json
{
  "events": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 42,
    "pages": 4
  }
}
```

#### `POST /api/events` 🔒 Veranstalter

Neues Event erstellen.

**Request Body:**
```json
{
  "title": "Jazz Night am Main",
  "description": "Ein unvergesslicher Abend...",
  "startDate": "2026-08-15T19:00:00.000Z",
  "endDate": "2026-08-15T23:00:00.000Z",
  "location": "Mainufer Frankfurt",
  "locationAddress": "Schaumainkai 15, 60594 Frankfurt",
  "category": "CONCERT",
  "price": 25.00,
  "capacity": 200,
  "imageUrl": "https://...",
  "status": "PUBLISHED"
}
```

**Response `201`:** Event-Objekt

#### `GET /api/events/:id`

Event-Details mit Reviews und Durchschnittsbewertung.

**Response `200`:**
```json
{
  "event": {
    "id": "uuid",
    "title": "...",
    "organizer": { "name": "..." },
    "reviews": [...],
    "_count": { "bookings": 12, "reviews": 3 }
  },
  "avgRating": 4.5
}
```

#### `PUT /api/events/:id` 🔒 Veranstalter (eigene)

Event aktualisieren. Erlaubte Felder: title, description, startDate, endDate, location, locationAddress, category, price, capacity, imageUrl, status.

**Besonderheiten:**
- Kapazität kann nicht unter `ticketsSold` gesetzt werden
- Bei Status → `CANCELLED` werden alle gebuchten Besucher benachrichtigt

#### `DELETE /api/events/:id` 🔒 Veranstalter (eigene)

Event löschen (nur wenn keine Tickets verkauft).

---

### Bookings

#### `GET /api/bookings` 🔒

Eigene Buchungen auflisten.

**Response `200`:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "ticketCount": 2,
      "totalPrice": "50.00",
      "status": "CONFIRMED",
      "confirmationCode": "EH-ABCD1234",
      "event": { "title": "...", "startDate": "..." },
      "payment": { "status": "COMPLETED", "method": "CREDIT_CARD" }
    }
  ]
}
```

#### `POST /api/bookings` 🔒

Neue Buchung erstellen mit atomarer Kapazitätsprüfung.

**Request Body:**
```json
{
  "eventId": "uuid",
  "ticketCount": 2,
  "paymentMethod": "CREDIT_CARD"
}
```

**Response `201`:** Booking-Objekt mit Payment und Confirmation Code

**Fehler:**
- `400` – Ungültige Daten, Event ausverkauft, Event hat bereits stattgefunden
- `401` – Nicht authentifiziert

> ⚠️ **Konsistenz:** Die Kapazitätsprüfung erfolgt atomar auf Datenbankebene. Bei gleichzeitigen Buchungen wird nur die erste erfolgreich sein.

#### `GET /api/bookings/:id` 🔒

Buchungsdetails mit Event und Zahlungsinformationen.

#### `PUT /api/bookings/:id` 🔒

Buchung stornieren.

**Request Body:**
```json
{ "action": "cancel" }
```

**Ablauf:**
1. Booking-Status → `CANCELLED`
2. Payment-Status → `REFUNDED`
3. Event `ticketsSold` wird dekrementiert
4. Notification an Nutzer erstellt

---

### Reviews

#### `POST /api/reviews` 🔒

Event bewerten (nur mit bestätigter Buchung).

**Request Body:**
```json
{
  "eventId": "uuid",
  "rating": 5,
  "comment": "Tolles Event!"
}
```

**Fehler:**
- `403` – Keine bestätigte Buchung für dieses Event

---

### Notifications

#### `GET /api/notifications` 🔒

Eigene Benachrichtigungen (max. 20, neueste zuerst).

#### `PUT /api/notifications` 🔒

Benachrichtigung als gelesen markieren.

```json
{ "id": "uuid" }
```

Ohne `id` werden alle als gelesen markiert.

---

### Dashboard

#### `GET /api/dashboard/stats` 🔒 Veranstalter

Dashboard-Statistiken für den Veranstalter.

**Response `200`:**
```json
{
  "stats": {
    "totalEvents": 5,
    "publishedEvents": 3,
    "totalBookings": 42,
    "totalRevenue": 1250.00,
    "totalTicketsSold": 156
  },
  "events": [...],
  "recentBookings": [...],
  "eventStats": [...]
}
```

---

### Admin

#### `GET /api/admin/users` 🔒 Admin

Alle Nutzer auflisten.

#### `PUT /api/admin/users` 🔒 Admin

Nutzerrolle ändern.

```json
{
  "userId": "uuid",
  "newRole": "ORGANIZER"
}
```

---

## Enum-Werte

### Rollen
`VISITOR` | `ORGANIZER` | `ADMIN`

### Event-Status
`DRAFT` | `PUBLISHED` | `CANCELLED` | `COMPLETED`

### Event-Kategorie
`CONCERT` | `WORKSHOP` | `FESTIVAL` | `LECTURE` | `SPORTS` | `COMMUNITY` | `OTHER`

### Booking-Status
`PENDING` | `CONFIRMED` | `CANCELLED` | `REFUNDED`

### Payment-Status
`PENDING` | `COMPLETED` | `FAILED` | `REFUNDED`

### Payment-Methode
`CREDIT_CARD` | `PAYPAL` | `BANK_TRANSFER`

### Notification-Typ
`BOOKING_CONFIRMED` | `EVENT_REMINDER` | `EVENT_CANCELLED` | `REFUND_PROCESSED` | `REVIEW_RECEIVED`
