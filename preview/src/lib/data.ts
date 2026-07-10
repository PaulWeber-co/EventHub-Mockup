export const mockEvents = [
  {
    id: "evt_1",
    title: "Sommerfest am Rhein",
    description: "Ein großartiges Sommerfest mit Live-Musik, Foodtrucks und Getränken direkt am Rheinufer. Perfekt für die ganze Familie!",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // next week
    location: "Rheinufer, Mainz",
    category: "COMMUNITY",
    price: 15.0,
    capacity: 500,
    ticketsSold: 480,
    status: "PUBLISHED",
    imageUrl: "https://images.unsplash.com/photo-1533174000265-e8eb4c8c44aa?auto=format&fit=crop&q=80",
    organizer: {
      name: "RheinMain Genossenschaft",
    },
  },
  {
    id: "evt_2",
    title: "Tech-Meetup Frankfurt",
    description: "Das monatliche Treffen für Entwickler und Tech-Begeisterte in Frankfurt. Vorträge zu React, Next.js und AI.",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: "TechQuartier, Frankfurt",
    category: "OTHER",
    price: 0,
    capacity: 100,
    ticketsSold: 100,
    status: "PUBLISHED",
    imageUrl: "",
    organizer: {
      name: "Tech Meetup FFM",
    },
  },
  {
    id: "evt_3",
    title: "Weinprobe im Rheingau",
    description: "Exklusive Weinprobe mit ausgewählten Weinen aus der Region. Inklusive Käseplatte und Wasser.",
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Schloss Johannisberg, Geisenheim",
    category: "OTHER",
    price: 45.0,
    capacity: 30,
    ticketsSold: 12,
    status: "PUBLISHED",
    imageUrl: "",
    organizer: {
      name: "Rheingau Weine e.V.",
    },
  },
  {
    id: "evt_4",
    title: "Startup Pitch Night",
    description: "Die spannendsten Startups der Region pitchen ihre Ideen vor Investoren und Publikum.",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Kulturzentrum Schlachthof, Wiesbaden",
    category: "OTHER",
    price: 10.0,
    capacity: 200,
    ticketsSold: 85,
    status: "PUBLISHED",
    imageUrl: "",
    organizer: {
      name: "Startup Network RheinMain",
    },
  }
];

export const getEvents = async () => mockEvents;
export const getEventById = async (id: string) => mockEvents.find((e) => e.id === id) || null;
