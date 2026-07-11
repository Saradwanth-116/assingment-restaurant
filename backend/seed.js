require("dotenv").config();
const mongoose = require("mongoose");
const Restaurant = require("./models/Restaurant");
const Table = require("./models/Table");

// Connect to MongoDB
const uri = process.env.MONGO_URI;

const seedData = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data if desired (optional)
    // await Restaurant.deleteMany({});
    // await Table.deleteMany({});

    const restaurantsData = [
      {
        name: "The Golden Dragon",
        location: { address: "123 Imperial Way, Mumbai" },
        images: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Chinese",
        costForTwo: 1200,
        rating: 4.5,
        reviewsCount: 320,
        isTrending: true,
        isTopRated: true,
        menu: {
          starters: [{ name: "Spring Rolls", price: 250 }, { name: "Dim Sum", price: 350 }],
          mainCourse: [{ name: "Kung Pao Chicken", price: 600 }],
          desserts: [{ name: "Fried Ice Cream", price: 200 }]
        }
      },
      {
        name: "Bella Napoli",
        location: { address: "45 Olive St, Bengaluru" },
        images: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Italian",
        costForTwo: 1500,
        rating: 4.8,
        reviewsCount: 512,
        isPremium: true,
        menu: {
          starters: [{ name: "Bruschetta", price: 300 }],
          mainCourse: [{ name: "Margherita Pizza", price: 700 }, { name: "Truffle Pasta", price: 900 }],
          desserts: [{ name: "Tiramisu", price: 350 }]
        }
      },
      {
        name: "Spice Symphony",
        location: { address: "78 Curry Lane, Delhi" },
        images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "North Indian",
        costForTwo: 900,
        rating: 4.2,
        reviewsCount: 150,
        isTrending: true,
        menu: {
          starters: [{ name: "Paneer Tikka", price: 250 }],
          mainCourse: [{ name: "Butter Chicken", price: 450 }],
          desserts: [{ name: "Gulab Jamun", price: 150 }]
        }
      },
      {
        name: "Tokyo Drift Sushi",
        location: { address: "90 Sakura Ave, Pune" },
        images: ["https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Japanese",
        costForTwo: 2200,
        rating: 4.7,
        reviewsCount: 420,
        isTopRated: true,
        isPremium: true,
        menu: {
          starters: [{ name: "Miso Soup", price: 200 }],
          mainCourse: [{ name: "Dragon Roll", price: 800 }],
          desserts: [{ name: "Mochi Ice Cream", price: 300 }]
        }
      },
      {
        name: "El Camino Taqueria",
        location: { address: "12 Fiesta Blvd, Hyderabad" },
        images: ["https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Mexican",
        costForTwo: 800,
        rating: 4.3,
        reviewsCount: 230,
        menu: {
          starters: [{ name: "Nachos Supreme", price: 350 }],
          mainCourse: [{ name: "Chicken Fajitas", price: 450 }],
          desserts: [{ name: "Churros", price: 200 }]
        }
      },
      {
        name: "Le Petit Bistro",
        location: { address: "33 Champs Elysees, Mumbai" },
        images: ["https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "French",
        costForTwo: 3000,
        rating: 4.9,
        reviewsCount: 600,
        isPremium: true,
        menu: {
          starters: [{ name: "Escargots", price: 800 }],
          mainCourse: [{ name: "Coq au Vin", price: 1500 }],
          desserts: [{ name: "Crème Brûlée", price: 500 }]
        }
      },
      {
        name: "Mughal Darbar",
        location: { address: "55 Royal Fort Rd, Lucknow" },
        images: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Awadhi",
        costForTwo: 1100,
        rating: 4.6,
        reviewsCount: 890,
        isTopRated: true,
        menu: {
          starters: [{ name: "Galouti Kebab", price: 400 }],
          mainCourse: [{ name: "Mutton Biryani", price: 600 }],
          desserts: [{ name: "Shahi Tukda", price: 250 }]
        }
      },
      {
        name: "The Vegan Bowl",
        location: { address: "88 Green St, Bengaluru" },
        images: ["https://images.unsplash.com/photo-1498837167922-41c54b0d0092?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Healthy/Vegan",
        costForTwo: 750,
        rating: 4.4,
        reviewsCount: 180,
        isTrending: true,
        menu: {
          starters: [{ name: "Quinoa Salad", price: 300 }],
          mainCourse: [{ name: "Buddha Bowl", price: 450 }],
          desserts: [{ name: "Vegan Brownie", price: 200 }]
        }
      },
      {
        name: "Oceanic Seafoods",
        location: { address: "1 Marine Drive, Goa" },
        images: ["https://images.unsplash.com/photo-1549488344-c5a4fa7098e9?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "Seafood",
        costForTwo: 1800,
        rating: 4.5,
        reviewsCount: 340,
        menu: {
          starters: [{ name: "Calamari Rings", price: 450 }],
          mainCourse: [{ name: "Grilled Lobster", price: 1200 }],
          desserts: [{ name: "Coconut Flan", price: 300 }]
        }
      },
      {
        name: "Burger Joint",
        location: { address: "42 Fast Lane, Chennai" },
        images: ["https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop"],
        cuisine: "American",
        costForTwo: 600,
        rating: 4.1,
        reviewsCount: 950,
        isTrending: true,
        menu: {
          starters: [{ name: "Cheese Fries", price: 150 }],
          mainCourse: [{ name: "Double Cheeseburger", price: 350 }],
          desserts: [{ name: "Milkshake", price: 150 }]
        }
      }
    ];

    console.log("Creating restaurants...");
    const createdRestaurants = [];
    
    for (const data of restaurantsData) {
      // Check if it exists to avoid duplication errors
      let r = await Restaurant.findOne({ name: data.name });
      if (!r) {
        r = await Restaurant.create(data);
        createdRestaurants.push(r);
      } else {
        console.log(`Restaurant '${data.name}' already exists, skipping...`);
        createdRestaurants.push(r);
      }
    }

    console.log("Creating tables for each restaurant...");
    
    const tableTypes = [
      { name: "couple", capacity: 2, quantity: 5 },
      { name: "family", capacity: 4, quantity: 3 },
      { name: "large_family", capacity: 8, quantity: 2 },
      { name: "party", capacity: 12, quantity: 1 }
    ];

    for (const r of createdRestaurants) {
      for (const tt of tableTypes) {
        const existingTable = await Table.findOne({ name: tt.name, restaurant: r._id });
        if (!existingTable) {
          await Table.create({
            name: tt.name,
            capacity: tt.capacity,
            quantity: tt.quantity,
            restaurant: r._id
          });
        }
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
