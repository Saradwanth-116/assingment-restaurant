# Tavola Reservations (Table Harmony)

Tavola Reservations is a modern, responsive full-stack web application that seamlessly bridges the gap between restaurant discovery and table booking. It offers a premium, intuitive user interface for customers to find and reserve tables, alongside a powerful dashboard for administrators to manage operations.

## Links

- **Live URL**: [https://assingment-restaurant.vercel.app/](https://assingment-restaurant.vercel.app/)
- **GitHub Repository**: [https://github.com/Saradwanth-116/assingment-restaurant](https://github.com/Saradwanth-116/assingment-restaurant)

---

## 👨‍🍳 Features for Customers (Users)

### 1. Authentication & Onboarding
- Secure User Registration and Login.
- Distinct portals for Customers and Administrators.

### 2. Discover & Explore
- **Rich Restaurant Cards**: Browse restaurants beautifully presented with cover images, cuisines, cost for two, locations, and ratings.
- **Badges & Tags**: Quickly spot *Trending*, *Top Rated*, and *Premium* locations.
- **Explore Menu**: Click to view the restaurant's menu instantly (via external link, like Google Drive).

### 3. Smart Booking System
- **Real-time Availability**: Search for tables by filtering through specific Dates, Time Slots, and Party Sizes. The system automatically calculates table capacities and active bookings to prevent double-booking.
- **Frictionless Booking**: Reserve an available table in just a few clicks.

### 4. Personal Dashboard
- View a history of all upcoming and past reservations.
- Cancel reservations with a single click if plans change.

---

## 👑 Features for Administrators

The Admin Dashboard provides complete control over the platform's data across three intuitive tabs:

### 1. Global Reservation Management
- View every reservation made across all restaurants on the platform.
- **Date Filtering**: Quickly filter bookings for a specific day.
- **Edit Reservations**: Modify any existing reservation directly (including changing the date, time, party size, table, or even the restaurant entirely).
- **Cancel Reservations**: Instantly cancel bookings as needed.

### 2. Restaurant Management
- **Add New Restaurants**: Onboard new partners by providing name, location, cuisine, cost, cover image URL, and a menu link.
- **Edit Details**: Update restaurant information dynamically (e.g., swapping out the cover photo or updating the menu link).
- **Remove Restaurants**: Delete partnerships from the platform.

### 3. Table & Inventory Management
- **Add Tables**: Define inventory for specific restaurants by setting table names (e.g., "couple", "family"), capacity, and quantity available.
- **Edit & Delete Tables**: Modify table capacities or remove tables to instantly reflect real-world restaurant floor plans.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion (for fluid animations), TanStack Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT Authentication, bcrypt password hashing
