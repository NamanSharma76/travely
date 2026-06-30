import { PrismaClient, PackageCategory, ProviderStatus, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create a provider user
  const hashedPassword = await bcrypt.hash("Provider123", 12)

  const providerUser = await prisma.user.upsert({
    where: { email: "provider@travely.com" },
    update: {},
    create: {
      name: "Wanderlust Travels",
      email: "provider@travely.com",
      password: hashedPassword,
      role: Role.PROVIDER,
    },
  })

  // Create provider profile
  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      businessName: "Wanderlust Travels",
      description: "Premium travel experiences across India and Southeast Asia since 2010.",
      phone: "+91 98765 43210",
      website: "https://wanderlust.com",
      status: ProviderStatus.VERIFIED,
    },
  })

  // Create a second provider
  const providerUser2 = await prisma.user.upsert({
    where: { email: "himalayan@travely.com" },
    update: {},
    create: {
      name: "Himalayan Adventures",
      email: "himalayan@travely.com",
      password: hashedPassword,
      role: Role.PROVIDER,
    },
  })

  const provider2 = await prisma.provider.upsert({
    where: { userId: providerUser2.id },
    update: {},
    create: {
      userId: providerUser2.id,
      businessName: "Himalayan Adventures",
      description: "Specializing in trekking, camping, and adventure sports in the Himalayas.",
      phone: "+91 87654 32109",
      status: ProviderStatus.VERIFIED,
    },
  })

  // Packages data
  const packages = [
    {
      providerId: provider.id,
      title: "Kerala Backwaters & Beach Escape",
      slug: "kerala-backwaters-beach-escape",
      description: "Experience the serene backwaters of Kerala on a traditional houseboat, followed by relaxing days on pristine beaches. This package covers Alleppey, Kumarakom, and Varkala — three of Kerala's most stunning destinations. Wake up to the gentle sounds of water, enjoy authentic Kerala cuisine, and witness breathtaking sunsets over the Arabian Sea.",
      country: "India",
      destination: "Kerala",
      category: PackageCategory.BEACH,
      durationDays: 7,
      pricePerPerson: 24999,
      maxTravelers: 12,
      images: [
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
        "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800",
        "https://images.unsplash.com/photo-1547636780-e41778614c28?w=800",
      ],
      inclusions: ["Houseboat stay (2 nights)", "Beach resort (4 nights)", "All meals", "Airport transfers", "Sightseeing tours", "Kathakali show"],
      exclusions: ["Flights", "Personal expenses", "Travel insurance", "Alcoholic beverages"],
      avgRating: 4.8,
      totalReviews: 124,
    },
    {
      providerId: provider.id,
      title: "Rajasthan Royal Heritage Tour",
      slug: "rajasthan-royal-heritage-tour",
      description: "Step into the land of maharajas and experience the grandeur of Rajasthan. From the pink city of Jaipur to the blue city of Jodhpur and the golden city of Jaisalmer, this tour takes you through magnificent forts, opulent palaces, and vibrant bazaars. Ride camels at sunset in the Thar Desert and stay in heritage havelis.",
      country: "India",
      destination: "Rajasthan",
      category: PackageCategory.CULTURAL,
      durationDays: 10,
      pricePerPerson: 34999,
      maxTravelers: 16,
      images: [
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
      ],
      inclusions: ["Heritage hotel stays", "All breakfasts", "AC transport", "Licensed guide", "Camel safari", "Folk dance show"],
      exclusions: ["Flights", "Lunches & dinners", "Entry fees", "Tips"],
      avgRating: 4.7,
      totalReviews: 89,
    },
    {
      providerId: provider2.id,
      title: "Manali & Spiti Valley Adventure",
      slug: "manali-spiti-valley-adventure",
      description: "An epic road trip through some of the world's highest motorable roads. Journey from the lush green valleys of Manali to the stark, otherworldly landscapes of Spiti Valley. Cross high mountain passes, visit ancient Buddhist monasteries, and camp under skies full of stars. This is Himachal Pradesh at its most dramatic.",
      country: "India",
      destination: "Himachal Pradesh",
      category: PackageCategory.ADVENTURE,
      durationDays: 9,
      pricePerPerson: 28999,
      maxTravelers: 10,
      images: [
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
        "https://images.unsplash.com/photo-1580289143186-03f54224aad4?w=800",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      ],
      inclusions: ["Hotel & camp stays", "All meals", "4x4 vehicle", "Experienced guide", "Camping equipment", "First aid kit"],
      exclusions: ["Flights to Manali", "Travel insurance", "Personal gear", "Tips"],
      avgRating: 4.9,
      totalReviews: 67,
    },
    {
      providerId: provider2.id,
      title: "Kedarnath & Badrinath Yatra",
      slug: "kedarnath-badrinath-yatra",
      description: "Embark on a sacred pilgrimage to two of the most revered Hindu shrines in the Himalayas. Trek through breathtaking mountain scenery to the ancient Kedarnath temple and visit the holy Badrinath shrine on the banks of the Alaknanda river. A journey that nourishes both body and soul.",
      country: "India",
      destination: "Uttarakhand",
      category: PackageCategory.PILGRIMAGE,
      durationDays: 8,
      pricePerPerson: 19999,
      maxTravelers: 20,
      images: [
        "https://images.unsplash.com/photo-1585516482738-31b6f5073a27?w=800",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      ],
      inclusions: ["Accommodation", "All meals", "Helicopter tickets (optional)", "Pony arrangements", "Puja arrangements", "Local guide"],
      exclusions: ["Train/flight to Haridwar", "Personal expenses", "Porter charges", "Medical expenses"],
      avgRating: 4.6,
      totalReviews: 203,
    },
    {
      providerId: provider.id,
      title: "Maldives Honeymoon Special",
      slug: "maldives-honeymoon-special",
      description: "The ultimate romantic getaway for newlyweds. Stay in a stunning overwater bungalow surrounded by crystal-clear turquoise waters. Enjoy private beach dinners, couples spa treatments, snorkeling in vibrant coral reefs, and watching the sun dip below the horizon from your private deck. Pure paradise, just for two.",
      country: "Maldives",
      destination: "North Malé Atoll",
      category: PackageCategory.HONEYMOON,
      durationDays: 6,
      pricePerPerson: 89999,
      maxTravelers: 2,
      images: [
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
        "https://images.unsplash.com/photo-1540202404-a2f29e66c3b5?w=800",
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
      ],
      inclusions: ["Overwater bungalow (5 nights)", "All meals (full board)", "Speedboat transfers", "Snorkeling equipment", "Couples spa (1 session)", "Sunset cruise", "Flower decoration"],
      exclusions: ["International flights", "Visa fees", "Scuba diving", "Personal shopping", "Premium beverages"],
      avgRating: 4.9,
      totalReviews: 45,
    },
    {
      providerId: provider.id,
      title: "Bali Family Adventure",
      slug: "bali-family-adventure",
      description: "Create unforgettable family memories in the Island of Gods. This family-friendly itinerary balances cultural experiences, outdoor adventures, and relaxation. Visit ancient temples, take a white-water rafting trip, explore lush rice terraces, and enjoy Bali's famous nightlife (for the adults!) while kids enjoy the beach and pool.",
      country: "Indonesia",
      destination: "Bali",
      category: PackageCategory.FAMILY,
      durationDays: 8,
      pricePerPerson: 45999,
      maxTravelers: 15,
      images: [
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
        "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800",
      ],
      inclusions: ["Resort accommodation", "Daily breakfast", "Private car & driver", "Guided temple tours", "White water rafting", "Cooking class", "Airport transfers"],
      exclusions: ["International flights", "Visa on arrival fee", "Lunches & dinners", "Travel insurance"],
      avgRating: 4.7,
      totalReviews: 78,
    },
    {
      providerId: provider2.id,
      title: "Jim Corbett Wildlife Safari",
      slug: "jim-corbett-wildlife-safari",
      description: "Venture into Jim Corbett National Park, India's oldest and most prestigious wildlife reserve, home to the majestic Bengal tiger. Experience thrilling jeep safaris through dense forests, spot elephants, leopards, and hundreds of bird species. Stay in a luxurious jungle resort and fall asleep to the sounds of the wild.",
      country: "India",
      destination: "Uttarakhand",
      category: PackageCategory.WILDLIFE,
      durationDays: 4,
      pricePerPerson: 15999,
      maxTravelers: 8,
      images: [
        "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800",
        "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800",
        "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800",
      ],
      inclusions: ["Jungle resort stay", "All meals", "3 jeep safaris", "Naturalist guide", "Park entry fees", "Elephant interaction"],
      exclusions: ["Transport to Corbett", "Tips for guides", "Personal expenses", "Camera fees"],
      avgRating: 4.5,
      totalReviews: 156,
    },
    {
      providerId: provider.id,
      title: "Goa Beach & Party Package",
      slug: "goa-beach-party-package",
      description: "The classic Goa experience, done right. Soak up the sun on pristine North and South Goa beaches, explore Portuguese heritage in Old Goa, indulge in fresh seafood, and experience Goa's legendary nightlife. Whether you're looking to relax or party, this package has something for everyone.",
      country: "India",
      destination: "Goa",
      category: PackageCategory.BEACH,
      durationDays: 5,
      pricePerPerson: 12999,
      maxTravelers: 20,
      images: [
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
        "https://images.unsplash.com/photo-1587922546307-776227941871?w=800",
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800",
      ],
      inclusions: ["Beach resort stay", "Daily breakfast", "North & South Goa sightseeing", "Old Goa tour", "Beach party entry", "Airport transfers"],
      exclusions: ["Flights", "Lunches & dinners", "Water sports", "Personal expenses"],
      avgRating: 4.4,
      totalReviews: 312,
    },
    {
      providerId: provider2.id,
      title: "Ladakh Bike Expedition",
      slug: "ladakh-bike-expedition",
      description: "The ultimate bucket-list ride for motorcyclists. Conquer the world's highest motorable roads on this epic Ladakh bike expedition. Ride through Khardung La, Changla Pass, and the mystical Nubra Valley. Camp under star-filled skies, interact with local nomads, and experience the raw, untamed beauty of the Himalayas on two wheels.",
      country: "India",
      destination: "Ladakh",
      category: PackageCategory.ADVENTURE,
      durationDays: 12,
      pricePerPerson: 42999,
      maxTravelers: 8,
      images: [
        "https://images.unsplash.com/photo-1598524369660-c2f10fc5e4ec?w=800",
        "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      ],
      inclusions: ["Royal Enfield 350cc", "Fuel", "Accommodation", "All meals", "Mechanic support vehicle", "Permits", "Experienced ride leader"],
      exclusions: ["Flights to Leh", "Riding gear (available for rent)", "Travel insurance", "Personal expenses"],
      avgRating: 4.9,
      totalReviews: 34,
    },
    {
      providerId: provider.id,
      title: "Singapore & Malaysia Budget Tour",
      slug: "singapore-malaysia-budget-tour",
      description: "Experience the best of two incredible Southeast Asian countries without breaking the bank. Marvel at Singapore's futuristic skyline and iconic Gardens by the Bay, then cross over to Malaysia to explore the vibrant streets of Kuala Lumpur, the colonial charm of Penang, and pristine island beaches.",
      country: "Singapore",
      destination: "Singapore & Malaysia",
      category: PackageCategory.BUDGET,
      durationDays: 9,
      pricePerPerson: 39999,
      maxTravelers: 18,
      images: [
        "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
        "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
        "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
      ],
      inclusions: ["Hotel stays", "Daily breakfast", "Singapore city tour", "Gardens by the Bay", "KL city tour", "Penang food tour", "All transfers"],
      exclusions: ["International flights", "Visa fees", "Lunches & dinners", "Universal Studios entry"],
      avgRating: 4.6,
      totalReviews: 91,
    },
  ]

  // Create packages with itineraries and available dates
  for (const pkg of packages) {
    const created = await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    })

    // Create itinerary days
    const itineraryDays = Array.from({ length: Math.min(pkg.durationDays, 5) }, (_, i) => ({
      packageId: created.id,
      day: i + 1,
      title: getDayTitle(i + 1, pkg.destination),
      description: getDayDescription(i + 1, pkg.destination),
      meals: i === 0 ? ["Dinner"] : i === pkg.durationDays - 1 ? ["Breakfast"] : ["Breakfast", "Dinner"],
      activities: getDayActivities(i + 1, pkg.category),
    }))

    for (const day of itineraryDays) {
      await prisma.itinerary.upsert({
        where: { packageId_day: { packageId: day.packageId, day: day.day } },
        update: {},
        create: day,
      })
    }

    // Create available dates (next 6 months)
    const dates = [
      { offset: 15, spots: 8 },
      { offset: 30, spots: 12 },
      { offset: 45, spots: 6 },
      { offset: 60, spots: 10 },
      { offset: 90, spots: 4 },
      { offset: 120, spots: 10 },
    ]

    for (const { offset, spots } of dates) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + offset)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + pkg.durationDays)

      await prisma.availableDate.create({
        data: {
          packageId: created.id,
          startDate,
          endDate,
          spotsLeft: Math.min(spots, pkg.maxTravelers),
          isAvailable: true,
        },
      })
    }

    console.log(`✅ Created: ${pkg.title}`)
  }

  console.log("✅ Seeding complete!")
}

function getDayTitle(day: number, destination: string): string {
  const titles: Record<number, string> = {
    1: `Arrival in ${destination}`,
    2: `Exploring ${destination}`,
    3: "Hidden Gems & Local Culture",
    4: "Adventure & Experiences",
    5: `Farewell to ${destination}`,
  }
  return titles[day] ?? `Day ${day} in ${destination}`
}

function getDayDescription(day: number, destination: string): string {
  const descriptions: Record<number, string> = {
    1: `Arrive at your destination and check into your accommodation. Meet your guide, freshen up, and enjoy a welcome dinner featuring local cuisine. Take an evening stroll to get your first taste of ${destination}.`,
    2: `After breakfast, begin your exploration of the main highlights. Visit iconic landmarks, interact with locals, and immerse yourself in the culture. Afternoon free for shopping or relaxation.`,
    3: `Venture off the beaten path today. Discover hidden gems that most tourists miss. Enjoy a home-cooked local meal and participate in a cultural activity or workshop.`,
    4: `Today is all about experiences. Depending on your package, enjoy an adventure activity, a scenic excursion, or a curated cultural performance. This is the highlight of the trip!`,
    5: `Enjoy a leisurely final breakfast and check out of your accommodation. Last-minute shopping or sightseeing before transfers to the airport/station. Farewell!`,
  }
  return descriptions[day] ?? `A wonderful day exploring the beauty and culture of ${destination}.`
}

function getDayActivities(day: number, category: PackageCategory): string[] {
  const activityMap: Record<PackageCategory, string[][]> = {
    BEACH: [["Airport transfer", "Hotel check-in", "Beach walk"], ["Beach activities", "Water sports", "Sunset viewing"], ["Boat trip", "Snorkeling", "Local seafood lunch"], ["Free beach day", "Spa session"], ["Checkout", "Departure transfer"]],
    ADVENTURE: [["Base camp arrival", "Gear check", "Briefing"], ["Trail hike", "Scenic viewpoints", "Camp setup"], ["Summit attempt", "Mountain views", "Celebration dinner"], ["Rest day", "Local village visit"], ["Descent", "Certificate ceremony", "Departure"]],
    CULTURAL: [["City orientation tour", "Hotel check-in"], ["Museum visits", "Heritage walk", "Local market"], ["Temple tour", "Cultural show", "Cooking class"], ["Day trip to nearby attraction"], ["Shopping", "Departure"]],
    HONEYMOON: [["Airport pickup", "Resort check-in", "Romantic dinner"], ["Couples spa", "Beach walk", "Candlelight dinner"], ["Excursion", "Sunset cruise"], ["Free day", "In-room dining"], ["Checkout", "Transfer"]],
    FAMILY: [["Arrival", "Hotel", "Welcome dinner"], ["Theme park / Family activity"], ["Cultural sightseeing", "Kids activities"], ["Adventure activity", "Pool time"], ["Checkout", "Departure"]],
    WILDLIFE: [["Resort check-in", "Evening nature walk"], ["Early morning safari", "Afternoon safari"], ["Full day safari", "Naturalist talk"], ["Checkout", "Departure"]],
    PILGRIMAGE: [["Arrival", "Puja", "Aarti"], ["Temple darshan", "Guided prayers"], ["Trek / Yatra"], ["Sacred river bath", "Blessings"], ["Return journey"]],
    LUXURY: [["Private transfer", "Suite check-in", "Champagne welcome"], ["Private guided tour", "Fine dining"], ["Exclusive experience", "Spa"], ["Leisure day", "Premium dinner"], ["Checkout"]],
    BUDGET: [["Group transfer", "Hostel/budget hotel"], ["City walking tour", "Street food"], ["Day trip", "Local transport"], ["Free exploration day"], ["Checkout", "Departure"]],
    GROUP: [["Group arrival", "Introductions", "Orientation"], ["Group sightseeing"], ["Group activity", "Team bonding"], ["Free time", "Group dinner"], ["Farewell", "Departure"]],
  }
  return activityMap[category]?.[day - 1] ?? ["Sightseeing", "Local experiences", "Leisure time"]
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })