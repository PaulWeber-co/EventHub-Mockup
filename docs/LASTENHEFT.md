# Lastenheft EventHub

**Auftraggeber:** RheinMain Veranstaltungsgenossenschaft eG (fiktiv)
**Auftragnehmer:** Entwicklungsteams des Kurses „Agiles Software Engineering & Softwaretechnik"
**Dokumenttyp:** Kundenanforderungen
**Version:** 1.0
**Stand:** 09.06.2026

---

## 1. Zielbestimmung

Die RheinMain Veranstaltungsgenossenschaft eG möchte regionalen Veranstaltern und Besuchern eine gemeinsame digitale Plattform – „EventHub" – zur Verfügung stellen. Veranstalter sollen Events anlegen und verwalten, Besucher sollen Events finden, Tickets buchen und bezahlen können.

In seiner Endausbaustufe bildet EventHub den vollständigen Weg von der Veranstaltung bis zum gebuchten Ticket ab. Veranstalter können Veranstaltungen anlegen, veröffentlichen und mit einer Kapazität versehen, während Besucher die veröffentlichten Veranstaltungen finden und Tickets buchen können. Der Buchungsvorgang schließt eine Bezahlung ein und berücksichtigt dabei die verfügbare Kapazität korrekt, sodass keine Überbuchungen entstehen. Ihre gebuchten Tickets können Besucher anschließend jederzeit einsehen.

### Wünschenswerte Erweiterungen (Nice-to-have)

- Empfehlungen und personalisierte Vorschläge für Besucher
- Live-Anzeige von Restkapazität oder „fast ausverkauft"
- Stornierung mit Erstattung
- Bewertungen und Rezensionen besuchter Veranstaltungen
- Erinnerungen und Benachrichtigungen vor Veranstaltungsbeginn
- Verkaufs- und Auslastungs-Dashboard für Veranstalter

### Bewusst ausgeschlossen

- Keine reale Zahlungsabwicklung – Bezahlung wird simuliert
- Keine native Mobile-App – Browser genügt
- Keine mehrsprachige Oberfläche
- Keine Sitzplatz-/Saalplanverwaltung – Kapazität als Zahl
- Kein Betrieb mit echten personenbezogenen Daten Dritter

---

## 2. Produkteinsatz

### 2.1 Anwendungsbereiche

EventHub wird zur Veröffentlichung und Buchung regionaler Veranstaltungen eingesetzt (Konzerte, Workshops, Vereinsfeste, Vorträge).

### 2.2 Zielgruppen / Nutzergruppen

| Rolle | Beschreibung |
|---|---|
| **Besucher** | Sucht, bucht, bezahlt, verwaltet Tickets, bewertet |
| **Veranstalter** | Legt Veranstaltungen an, pflegt Kapazitäten, sieht Verkäufe |
| **Administrator** | Verwaltet Nutzer und moderiert Inhalte |

### 2.3 Betriebsbedingungen

Webbasierte Anwendung, lauffähig in gängigen Desktop-Browsern. Mehrbenutzerbetrieb mit gleichzeitig aktiven Nutzern.

---

## 3. Produktübersicht

EventHub verbindet zwei Seiten eines gemeinsamen Marktplatzes: Veranstalter stellen Angebote ein, Besucher nehmen sie wahr. Sämtliche Funktionen greifen auf einen geteilten fachlichen Kern zu (Nutzer, Veranstaltungen, Buchungen, Zahlungen). Die Konsistenz dieses Kerns über alle Funktionen hinweg ist die zentrale Qualitätsanforderung.

---

## 4. Funktionale Anforderungen

### FA-01: Registrierung und Anmeldung
Nutzer müssen sich registrieren und anmelden können. Bei der Registrierung wird die Rolle (Besucher/Veranstalter) gewählt.

### FA-02: Event-Verwaltung (Veranstalter)
Ein Veranstalter muss eine neue Veranstaltung mit Titel, Beschreibung, Zeitpunkt, Ort, Kategorie, Preis und Kapazität erfassen und anschließend veröffentlichen, bearbeiten oder zurückziehen können.

### FA-03: Event-Suche (Besucher)
Besucher müssen veröffentlichte Veranstaltungen durchsuchen und nach Datum, Ort oder Kategorie filtern können.

### FA-04: Ticket-Buchung mit Kapazitätsprüfung
Ein Besucher muss Karten buchen können, solange Plätze frei sind. Die verfügbare Kapazität muss zuverlässig und ohne Doppelvergabe verringert werden.

### FA-05: Zahlungssimulation
Zum Abschluss gehört eine (simulierte) Bezahlung, die die Buchung verbindlich macht.

### FA-06: Buchungshistorie
Gebuchte Tickets und Buchungshistorie müssen jederzeit einsehbar sein.

### FA-07: Stornierung (Nice-to-have)
Buchungen stornierbar mit simulierter Erstattung.

### FA-08: Bewertungen (Nice-to-have)
Besucher können besuchte Events bewerten – nur mit vorheriger Buchung.

### FA-09: Benachrichtigungen (Nice-to-have)
Erinnerungen vor Veranstaltungsbeginn, Buchungsbestätigungen.

### FA-10: Veranstalter-Dashboard (Nice-to-have)
Verkaufs- und Auslastungsübersicht für Veranstalter.

---

## 5. Produktdaten

| Entität | Wichtige Attribute |
|---|---|
| **Nutzer** | Identität, Rolle, Profildaten |
| **Veranstaltung** | Titel, Beschreibung, Zeitpunkt, Ort, Kategorie, Preis, Kapazität, Status |
| **Buchung** | Nutzer, Veranstaltung, Ticketanzahl, Status |
| **Zahlung** | Betrag, Status, ggf. Erstattung |
| **Benachrichtigung** | Empfänger, Anlass, Inhalt, Zeitpunkt |
| **Bewertung** | Nutzer, Veranstaltung, Wertung, Text |

---

## 6. Qualitätsanforderungen

Die mit Abstand wichtigste Eigenschaft ist die **Konsistenz des gemeinsamen Datenbestands**. Widersprüchliche Zustände dürfen nicht entstehen – es darf weder mehr verkaufte als vorhandene Tickets geben noch dürfen sich Status widersprechen.

---

## 7. Rahmenbedingungen

- Webbasierte Anwendung für Desktop-Browser
- Gemeinsame Codebasis und gemeinsamer Datenbestand
- Keine Insellösungen je Funktionsbereich
- Externe Dienste dürfen simuliert werden

---

## 8. Abnahmekriterien

Als abgenommen gilt das Produkt, wenn der durchgängige Kernablauf funktioniert:
1. Veranstaltung anlegen ✅
2. Veranstaltung finden ✅
3. Tickets buchen ✅
4. Bezahlen ✅
5. Ticket einsehen ✅

---

## 9. Glossar

| Begriff | Definition |
|---|---|
| **Veranstaltung (Event)** | Ein buchbares Ereignis mit begrenzter Kapazität |
| **Buchung** | Verbindliche Reservierung einer oder mehrerer Karten |
| **Kapazität** | Maximale Anzahl buchbarer Karten |
| **Inkrement** | Lauffähiger, integrierter Stand des Gesamtprodukts |
