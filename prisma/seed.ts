import { PrismaClient, Role, EventStatus, EventCategory, BookingStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check if data already exists
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("⚠️  Database already seeded, skipping...");
    return;
  }

  // ---- Users ----
  const passwordHash = await hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@eventhub.de",
      passwordHash,
      name: "Max Admin",
      role: Role.ADMIN,
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      email: "veranstalter@eventhub.de",
      passwordHash,
      name: "Lisa Veranstalterin",
      role: Role.ORGANIZER,
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: "kulturverein@eventhub.de",
      passwordHash,
      name: "Kulturverein RheinMain",
      role: Role.ORGANIZER,
    },
  });

  const visitor1 = await prisma.user.create({
    data: {
      email: "besucher@eventhub.de",
      passwordHash,
      name: "Anna Besucherin",
      role: Role.VISITOR,
    },
  });

  const visitor2 = await prisma.user.create({
    data: {
      email: "thomas@eventhub.de",
      passwordHash,
      name: "Thomas Müller",
      role: Role.VISITOR,
    },
  });

  // ---- Events ----
  const now = new Date();
  const future = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const past = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const event1 = await prisma.event.create({
    data: {
      organizerId: organizer1.id,
      title: "Jazz Night am Main",
      description:
        "Ein unvergesslicher Abend mit den besten Jazz-Musikern der Region. Genießen Sie live Musik unter freiem Himmel direkt am Frankfurter Mainufer. Für Getränke und kleine Snacks ist gesorgt. Der perfekte Abend für Jazz-Liebhaber und alle, die es werden wollen!",
      startDate: future(14),
      endDate: future(14),
      location: "Mainufer Frankfurt",
      locationAddress: "Schaumainkai 15, 60594 Frankfurt am Main",
      category: EventCategory.CONCERT,
      price: 25.0,
      capacity: 200,
      ticketsSold: 156,
      status: EventStatus.PUBLISHED,
      imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800",
    },
  });

  const event2 = await prisma.event.create({
    data: {
      organizerId: organizer1.id,
      title: "Webentwicklung Workshop: React & Next.js",
      description:
        "Hands-on Workshop für Einsteiger und Fortgeschrittene. Lernen Sie moderne Webentwicklung mit React und Next.js. Eigener Laptop erforderlich. Inklusive Mittagessen und Getränke. Am Ende des Workshops haben Sie Ihre eigene Webanwendung erstellt!",
      startDate: future(7),
      endDate: future(7),
      location: "TechHub Wiesbaden",
      locationAddress: "Wilhelmstraße 42, 65183 Wiesbaden",
      category: EventCategory.WORKSHOP,
      price: 89.0,
      capacity: 30,
      ticketsSold: 28,
      status: EventStatus.PUBLISHED,
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    },
  });

  const event3 = await prisma.event.create({
    data: {
      organizerId: organizer2.id,
      title: "RheinMain Sommerfest 2026",
      description:
        "Das große Sommerfest für die ganze Familie! Live-Musik, Essenstände, Kinderprogramm und vieles mehr. Feiern Sie mit uns den Sommer in der schönsten Region Deutschlands. Eintritt für Kinder unter 12 Jahren frei!",
      startDate: future(30),
      endDate: future(30),
      location: "Kurpark Wiesbaden",
      locationAddress: "Kurhausplatz 1, 65189 Wiesbaden",
      category: EventCategory.FESTIVAL,
      price: 15.0,
      capacity: 500,
      ticketsSold: 120,
      status: EventStatus.PUBLISHED,
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    },
  });

  const event4 = await prisma.event.create({
    data: {
      organizerId: organizer2.id,
      title: "Künstliche Intelligenz im Alltag – Vortrag",
      description:
        "Prof. Dr. Schmidt von der TU Darmstadt spricht über die praktischen Anwendungen von KI im Alltag. Von Sprachassistenten bis zur medizinischen Diagnostik – erfahren Sie, wie KI unser Leben bereits heute verändert. Im Anschluss offene Diskussionsrunde.",
      startDate: future(21),
      endDate: future(21),
      location: "Stadthalle Darmstadt",
      locationAddress: "Holzhofallee 2, 64295 Darmstadt",
      category: EventCategory.LECTURE,
      price: 10.0,
      capacity: 150,
      ticketsSold: 45,
      status: EventStatus.PUBLISHED,
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    },
  });

  const event5 = await prisma.event.create({
    data: {
      organizerId: organizer1.id,
      title: "Charity-Fußballturnier",
      description:
        "Acht Teams treten gegeneinander an – für den guten Zweck! Alle Einnahmen gehen an die Kinderhilfe RheinMain. Verpflegung vor Ort. Kommen Sie vorbei und feuern Sie die Teams an!",
      startDate: future(10),
      endDate: future(10),
      location: "Sportpark Mainz",
      locationAddress: "Am Gonsenheimer Wald 3, 55122 Mainz",
      category: EventCategory.SPORTS,
      price: 5.0,
      capacity: 300,
      ticketsSold: 0,
      status: EventStatus.PUBLISHED,
      imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    },
  });

  const event6 = await prisma.event.create({
    data: {
      organizerId: organizer2.id,
      title: "Weinprobe Rheingau (Entwurf)",
      description:
        "Exklusive Weinprobe mit ausgewählten Weinen aus dem Rheingau. Begleitet von einem Sommelier und kleinen kulinarischen Häppchen.",
      startDate: future(45),
      endDate: future(45),
      location: "Weingut Müller, Eltville",
      locationAddress: "Rheinallee 5, 65343 Eltville am Rhein",
      category: EventCategory.COMMUNITY,
      price: 45.0,
      capacity: 40,
      ticketsSold: 0,
      status: EventStatus.DRAFT,
      imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
    },
  });

  // Past event (for reviews)
  const pastEvent = await prisma.event.create({
    data: {
      organizerId: organizer1.id,
      title: "Frühlingskonzert im Park",
      description: "Ein wundervolles Konzert mit klassischer Musik im Stadtpark.",
      startDate: past(14),
      endDate: past(14),
      location: "Stadtpark Offenbach",
      locationAddress: "Berliner Str. 100, 63065 Offenbach",
      category: EventCategory.CONCERT,
      price: 20.0,
      capacity: 100,
      ticketsSold: 85,
      status: EventStatus.COMPLETED,
      imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    },
  });

  // ---- Bookings & Payments ----
  const booking1 = await prisma.booking.create({
    data: {
      userId: visitor1.id,
      eventId: event1.id,
      ticketCount: 2,
      totalPrice: 50.0,
      status: BookingStatus.CONFIRMED,
      confirmationCode: "EH-JAZZ2024",
      payment: {
        create: {
          amount: 50.0,
          method: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.COMPLETED,
          transactionId: "TXN-SEED-001",
          paidAt: new Date(),
        },
      },
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: visitor1.id,
      eventId: pastEvent.id,
      ticketCount: 1,
      totalPrice: 20.0,
      status: BookingStatus.CONFIRMED,
      confirmationCode: "EH-SPRING24",
      payment: {
        create: {
          amount: 20.0,
          method: PaymentMethod.PAYPAL,
          status: PaymentStatus.COMPLETED,
          transactionId: "TXN-SEED-002",
          paidAt: past(20),
        },
      },
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: visitor2.id,
      eventId: event2.id,
      ticketCount: 1,
      totalPrice: 89.0,
      status: BookingStatus.CONFIRMED,
      confirmationCode: "EH-WORKSHOP1",
      payment: {
        create: {
          amount: 89.0,
          method: PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.COMPLETED,
          transactionId: "TXN-SEED-003",
          paidAt: new Date(),
        },
      },
    },
  });

  // ---- Reviews ----
  await prisma.review.create({
    data: {
      userId: visitor1.id,
      eventId: pastEvent.id,
      rating: 5,
      comment: "Wunderschönes Konzert! Die Musiker waren fantastisch und die Atmosphäre im Park war magisch. Komme nächstes Jahr auf jeden Fall wieder!",
    },
  });

  await prisma.review.create({
    data: {
      userId: visitor2.id,
      eventId: pastEvent.id,
      rating: 4,
      comment: "Tolle Veranstaltung, nur die Sitzplätze hätten bequemer sein können. Musik war top!",
    },
  });

  // ---- Notifications ----
  await prisma.notification.create({
    data: {
      userId: visitor1.id,
      eventId: event1.id,
      type: "BOOKING_CONFIRMED",
      title: "Buchung bestätigt",
      message: "Ihre Buchung für 'Jazz Night am Main' wurde bestätigt. Confirmation Code: EH-JAZZ2024",
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: visitor1.id,
      eventId: event1.id,
      type: "EVENT_REMINDER",
      title: "Erinnerung: Jazz Night am Main",
      message: "In 3 Tagen findet die 'Jazz Night am Main' statt. Vergessen Sie Ihre Tickets nicht!",
      isRead: false,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("   📧 Demo-Accounts (Passwort: password123):");
  console.log("   - Admin:        admin@eventhub.de");
  console.log("   - Veranstalter: veranstalter@eventhub.de");
  console.log("   - Besucher:     besucher@eventhub.de");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
