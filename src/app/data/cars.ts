export type Car = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  dayRate: number;
  cardImage: string;
  images: string[];
  passengerCapacity?: number | null;
};

export const testCars: Car[] = [
  {
    id: "civic-sport",
    name: "Civic Sport",
    category: "Sedan, Manual",
    passengerCapacity: 5,
    tagline: "Balanced city comfort with sharp highway response.",
    description: "Balanced city comfort with sharp highway response and practical cabin space.",
    dayRate: 2800,
    cardImage: "/cars/placeholder-01.svg",
    images: ["/cars/placeholder-01.svg", "/cars/placeholder-02.svg", "/cars/placeholder-03.svg"],
  },
  {
    id: "fortuner-xl",
    name: "Fortuner XL",
    category: "SUV, Automatic",
    passengerCapacity: 7,
    tagline: "Full-size confidence with long-haul comfort.",
    description: "A full-size SUV tuned for long-haul comfort, visibility, and luggage flexibility.",
    dayRate: 4500,
    cardImage: "/cars/placeholder-02.svg",
    images: ["/cars/placeholder-02.svg", "/cars/placeholder-01.svg", "/cars/placeholder-03.svg"],
  },
  {
    id: "vios-prime",
    name: "Vios Prime",
    category: "Sedan, CVT",
    passengerCapacity: 5,
    tagline: "Compact precision made for dense urban driving.",
    description: "Compact sedan with smooth daily drivability and efficient city-focused performance.",
    dayRate: 2200,
    cardImage: "/cars/placeholder-03.svg",
    images: ["/cars/placeholder-03.svg", "/cars/placeholder-01.svg", "/cars/placeholder-02.svg"],
  },
  {
    id: "hilux-trail",
    name: "Hilux Trail",
    category: "Pickup, Manual",
    passengerCapacity: 5,
    tagline: "Rugged utility with premium control.",
    description: "Rugged pickup platform with reliable torque delivery and mixed-use utility space.",
    dayRate: 3900,
    cardImage: "/cars/placeholder-01.svg",
    images: ["/cars/placeholder-01.svg", "/cars/placeholder-03.svg", "/cars/placeholder-02.svg"],
  },
];
