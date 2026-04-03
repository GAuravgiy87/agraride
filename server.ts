/**
 * AgraRide Backend Server
 * Express.js + Prisma (PostgreSQL)
 */

import express from "express";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "5mb" }));

  // ========== SEED ADMIN ==========
  await prisma.user.upsert({
    where: { email: "admin@agraride.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@agraride.com",
      password: "admin",
      role: "admin",
    },
  });

  // ========== AUTH ENDPOINTS ==========

  app.post("/api/register", async (req, res) => {
    const { name, email, password, phone, gender, vehicle_type } = req.body;
    try {
      const user = await prisma.user.create({
        data: { name, email, password, phone, gender, vehicle_type },
      });
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        vehicle_type: user.vehicle_type,
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email, password } });
    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        vehicle_type: user.vehicle_type,
        profile_image: user.profile_image,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          gender: true,
          vehicle_type: true,
          profile_image: true,
        },
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    const id = Number(req.params.id);
    const {
      name,
      email,
      password,
      phone,
      gender,
      vehicle_type,
      profile_image,
    } = req.body;
    try {
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "User not found" });

      if (email && email !== existing.email) {
        const taken = await prisma.user.findFirst({
          where: { email, NOT: { id } },
        });
        if (taken)
          return res.status(400).json({ error: "Email already in use" });
      }

      const data: any = {};
      if (name !== undefined && name !== existing.name) data.name = name;
      if (email !== undefined && email !== existing.email) data.email = email;
      if (password?.trim()) data.password = password.trim();
      if (phone !== undefined && phone !== existing.phone) data.phone = phone;
      if (gender !== undefined && gender !== existing.gender)
        data.gender = gender;
      if (vehicle_type !== undefined && vehicle_type !== existing.vehicle_type)
        data.vehicle_type = vehicle_type;
      if (
        profile_image !== undefined &&
        profile_image !== existing.profile_image
      )
        data.profile_image = profile_image;

      if (Object.keys(data).length === 0)
        return res.status(400).json({ error: "No changes detected" });

      const updated = await prisma.user.update({ where: { id }, data });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/debug/users", async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(users);
  });

  // ========== RIDE ENDPOINTS ==========

  app.get("/api/rides", async (_req, res) => {
    const rides = await prisma.ride.findMany({
      where: { status: "active" },
      orderBy: { departure_time: "asc" },
      include: {
        driver: {
          select: { name: true, gender: true, vehicle_type: true, phone: true },
        },
      },
    });
    res.json(
      rides.map((r) => ({
        ...r,
        driver_name: r.driver.name,
        driver_gender: r.driver.gender,
        driver_vehicle: r.driver.vehicle_type,
        driver_phone: r.driver.phone,
      })),
    );
  });

  app.get("/api/rides/driver/:driverId", async (req, res) => {
    const rides = await prisma.ride.findMany({
      where: { driver_id: Number(req.params.driverId) },
      orderBy: { departure_time: "desc" },
    });
    res.json(rides);
  });

  app.post("/api/rides", async (req, res) => {
    const {
      driver_id,
      origin,
      destination,
      departure_time,
      available_seats,
      price_per_seat,
      driver_vehicle,
      driver_vehicle_description,
      license_plate,
      license_plate_verified,
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
    } = req.body;
    try {
      const ride = await prisma.ride.create({
        data: {
          driver_id: Number(driver_id),
          origin,
          destination,
          departure_time,
          available_seats: Number(available_seats),
          price_per_seat: Number(price_per_seat),
          driver_vehicle,
          driver_vehicle_description,
          license_plate,
          license_plate_verified: !!license_plate_verified,
          origin_lat,
          origin_lng,
          dest_lat,
          dest_lng,
        },
      });
      res.json({ id: ride.id });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/rides/:id", async (req, res) => {
    const {
      origin,
      destination,
      departure_time,
      available_seats,
      price_per_seat,
      driver_vehicle,
      driver_vehicle_description,
      license_plate,
      license_plate_verified,
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
    } = req.body;
    try {
      await prisma.ride.update({
        where: { id: Number(req.params.id) },
        data: {
          origin,
          destination,
          departure_time,
          available_seats: Number(available_seats),
          price_per_seat: Number(price_per_seat),
          driver_vehicle,
          driver_vehicle_description,
          license_plate,
          license_plate_verified: !!license_plate_verified,
          origin_lat,
          origin_lng,
          dest_lat,
          dest_lng,
        },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/rides/complete/:id", async (req, res) => {
    try {
      await prisma.ride.update({
        where: { id: Number(req.params.id) },
        data: { status: "completed" },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/rides/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
      await prisma.sosAlert.deleteMany({ where: { ride_id: id } });
      await prisma.rating.deleteMany({ where: { ride_id: id } });
      await prisma.message.deleteMany({ where: { ride_id: id } });
      await prisma.location.deleteMany({ where: { ride_id: id } });
      await prisma.booking.deleteMany({ where: { ride_id: id } });
      await prisma.ride.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/verify-license-plate", (req, res) => {
    const { plateNumber } = req.body;
    if (!plateNumber)
      return res.status(400).json({ error: "Plate number is required" });
    const patterns = [
      {
        regex: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/,
        name: "Standard (UP80AB1234)",
      },
      { regex: /^[A-Z]{2}\d{2}[A-Z]\d{4}$/, name: "Old Format (UP80A1234)" },
      { regex: /^[A-Z]{2}\d{6}$/, name: "Very Old (UP801234)" },
    ];
    const cleaned = plateNumber.toUpperCase().replace(/\s+/g, "");
    for (const p of patterns) {
      if (p.regex.test(cleaned))
        return res.json({ valid: true, format: p.name, cleanedPlate: cleaned });
    }
    res.json({ valid: false, format: null, cleanedPlate: cleaned });
  });

  // ========== BOOKING ENDPOINTS ==========

  app.post("/api/bookings", async (req, res) => {
    const { ride_id, passenger_id, seats_booked, counter_offer_price } =
      req.body;
    try {
      const existing = await prisma.booking.findFirst({
        where: {
          ride_id: Number(ride_id),
          passenger_id: Number(passenger_id),
          status: { in: ["pending", "confirmed"] },
        },
      });
      if (existing)
        return res
          .status(400)
          .json({ error: "You have already requested or booked this ride" });

      const ride = await prisma.ride.findUnique({
        where: { id: Number(ride_id) },
      });
      if (!ride || ride.available_seats < Number(seats_booked))
        return res.status(400).json({ error: "Not enough seats available" });

      await prisma.booking.create({
        data: {
          ride_id: Number(ride_id),
          passenger_id: Number(passenger_id),
          seats_booked: Number(seats_booked),
          status: "pending",
          counter_offer_price: counter_offer_price
            ? Number(counter_offer_price)
            : null,
        },
      });
      res.json({
        success: true,
        message: counter_offer_price
          ? "Counter offer sent to driver"
          : "Booking request sent to driver",
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/bookings/accept/:id", async (req, res) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(req.params.id) },
      });
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "confirmed" },
      });
      await prisma.ride.update({
        where: { id: booking.ride_id },
        data: { available_seats: { decrement: booking.seats_booked } },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/bookings/reject/:id", async (req, res) => {
    try {
      await prisma.booking.update({
        where: { id: Number(req.params.id) },
        data: { status: "rejected" },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/bookings/driver/:driverId", async (req, res) => {
    const bookings = await prisma.booking.findMany({
      where: {
        ride: { driver_id: Number(req.params.driverId) },
        status: "pending",
      },
      orderBy: { id: "desc" },
      include: {
        ride: {
          select: {
            origin: true,
            destination: true,
            departure_time: true,
            price_per_seat: true,
          },
        },
        passenger: { select: { name: true, phone: true, gender: true } },
      },
    });
    res.json(
      bookings.map((b) => ({
        ...b,
        origin: b.ride.origin,
        destination: b.ride.destination,
        departure_time: b.ride.departure_time,
        price_per_seat: b.ride.price_per_seat,
        passenger_name: b.passenger.name,
        passenger_phone: b.passenger.phone,
        passenger_gender: b.passenger.gender,
      })),
    );
  });

  app.get("/api/bookings/passenger/:passengerId", async (req, res) => {
    const bookings = await prisma.booking.findMany({
      where: { passenger_id: Number(req.params.passengerId) },
      orderBy: { ride: { departure_time: "desc" } },
      include: {
        ride: {
          select: {
            origin: true,
            destination: true,
            departure_time: true,
            status: true,
            driver_id: true,
            driver: { select: { name: true } },
          },
        },
      },
    });
    res.json(
      bookings.map((b) => ({
        ...b,
        origin: b.ride.origin,
        destination: b.ride.destination,
        departure_time: b.ride.departure_time,
        ride_status: b.ride.status,
        driver_id: b.ride.driver_id,
        driver_name: b.ride.driver.name,
      })),
    );
  });

  app.get("/api/bookings/check/:rideId/:passengerId", async (req, res) => {
    const booking = await prisma.booking.findFirst({
      where: {
        ride_id: Number(req.params.rideId),
        passenger_id: Number(req.params.passengerId),
      },
    });
    res.json({ hasBooked: !!booking, booking });
  });

  // ========== ADMIN ENDPOINTS ==========

  app.get("/api/admin/stats", async (_req, res) => {
    const [users, rides, bookings, recentRides, detailedBookings, activeSOS] =
      await Promise.all([
        prisma.user.count(),
        prisma.ride.count(),
        prisma.booking.count(),
        prisma.ride.findMany({
          take: 10,
          orderBy: { id: "desc" },
          include: { driver: { select: { name: true } } },
        }),
        prisma.booking.findMany({
          orderBy: { id: "desc" },
          include: {
            passenger: { select: { name: true } },
            ride: {
              select: {
                id: true,
                origin: true,
                destination: true,
                status: true,
                driver: { select: { name: true } },
              },
            },
          },
        }),
        prisma.sosAlert.findMany({
          where: { status: "active" },
          include: {
            user: { select: { name: true } },
            ride: {
              select: {
                origin: true,
                destination: true,
                driver_id: true,
                driver: { select: { name: true } },
                bookings: {
                  include: { passenger: { select: { name: true } } },
                },
              },
            },
          },
        }),
      ]);

    res.json({
      users,
      rides,
      bookings,
      recentRides: recentRides.map((r) => ({
        ...r,
        driver_name: r.driver.name,
      })),
      detailedBookings: detailedBookings.map((b) => ({
        id: b.id,
        seats_booked: b.seats_booked,
        passenger_name: b.passenger.name,
        driver_name: b.ride.driver.name,
        origin: b.ride.origin,
        destination: b.ride.destination,
        ride_status: b.ride.status,
        ride_id: b.ride.id,
      })),
      activeSOS: activeSOS.map((s) => ({
        ...s,
        user_name: s.user.name,
        origin: s.ride.origin,
        destination: s.ride.destination,
        driver_id: s.ride.driver_id,
        driver_name: s.ride.driver.name,
        passengers: s.ride.bookings.map((b) => b.passenger.name).join(", "),
      })),
    });
  });

  app.get("/api/admin/rides", async (_req, res) => {
    const rides = await prisma.ride.findMany({
      orderBy: { id: "desc" },
      include: {
        driver: { select: { name: true, phone: true, gender: true } },
      },
    });
    res.json(
      rides.map((r) => ({
        ...r,
        driver_name: r.driver.name,
        driver_phone: r.driver.phone,
        driver_gender: r.driver.gender,
      })),
    );
  });

  app.get("/api/admin/users", async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        vehicle_type: true,
        role: true,
      },
    });
    res.json(users);
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
      const userRides = await prisma.ride.findMany({
        where: { driver_id: id },
        select: { id: true },
      });
      const rideIds = userRides.map((r) => r.id);
      if (rideIds.length > 0) {
        await prisma.sosAlert.deleteMany({
          where: { ride_id: { in: rideIds } },
        });
        await prisma.rating.deleteMany({ where: { ride_id: { in: rideIds } } });
        await prisma.message.deleteMany({
          where: { ride_id: { in: rideIds } },
        });
        await prisma.location.deleteMany({
          where: { ride_id: { in: rideIds } },
        });
        await prisma.booking.deleteMany({
          where: { ride_id: { in: rideIds } },
        });
        await prisma.ride.deleteMany({ where: { driver_id: id } });
      }
      await prisma.booking.deleteMany({ where: { passenger_id: id } });
      await prisma.location.deleteMany({ where: { user_id: id } });
      await prisma.message.deleteMany({
        where: { OR: [{ sender_id: id }, { receiver_id: id }] },
      });
      await prisma.rating.deleteMany({
        where: { OR: [{ rater_id: id }, { rated_user_id: id }] },
      });
      await prisma.sosAlert.deleteMany({ where: { user_id: id } });
      await prisma.user.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
      await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { role: req.body.role },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ========== ADMIN DB ENDPOINTS ==========

  app.get("/api/admin/db/tables", async (_req, res) => {
    try {
      const tables: any[] = await prisma.$queryRaw`
        SELECT table_name as name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `;
      res.json(tables);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/db/table/:tableName", async (req, res) => {
    const { tableName } = req.params;
    // Whitelist to prevent SQL injection
    const allowed = [
      "User",
      "Ride",
      "Booking",
      "Location",
      "Message",
      "Rating",
      "SosAlert",
    ];
    if (!allowed.includes(tableName))
      return res.status(400).json({ error: "Invalid table name" });
    try {
      const rows = await (prisma as any)[
        tableName.charAt(0).toLowerCase() + tableName.slice(1)
      ].findMany();
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/db/query", async (req, res) => {
    const { query } = req.body;
    try {
      const result = await prisma.$queryRawUnsafe(query);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ========== SOS ENDPOINTS ==========

  app.post("/api/sos", async (req, res) => {
    const { ride_id, user_id, location } = req.body;
    if (!ride_id || !user_id)
      return res
        .status(400)
        .json({ error: "ride_id and user_id are required" });
    try {
      const ride = await prisma.ride.findFirst({
        where: { id: Number(ride_id), status: "active" },
      });
      if (!ride)
        return res.status(404).json({ error: "Active ride not found" });

      const existing = await prisma.sosAlert.findFirst({
        where: { ride_id: Number(ride_id), status: "active" },
      });
      if (existing)
        return res
          .status(409)
          .json({ error: "An active SOS alert already exists for this ride" });

      const alert = await prisma.sosAlert.create({
        data: { ride_id: Number(ride_id), user_id: Number(user_id) },
      });

      if (location?.latitude && location?.longitude) {
        await prisma.location
          .create({
            data: {
              ride_id: Number(ride_id),
              user_id: Number(user_id),
              latitude: location.latitude,
              longitude: location.longitude,
            },
          })
          .catch(() => {});
      }

      res.json({
        success: true,
        alert_id: alert.id,
        message: "Emergency alert created successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to create emergency alert." });
    }
  });

  app.post("/api/sos/resolve/:id", async (req, res) => {
    const { reason, resolved_by } = req.body;
    if (!reason?.trim())
      return res.status(400).json({ error: "Resolution reason is required" });
    try {
      await prisma.sosAlert.update({
        where: { id: Number(req.params.id) },
        data: {
          status: "resolved",
          resolved_reason: reason.trim(),
          resolved_by: Number(resolved_by),
          resolved_at: new Date(),
        },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ========== MESSAGING ENDPOINTS ==========

  app.get("/api/messages/:rideId", async (req, res) => {
    const messages = await prisma.message.findMany({
      where: { ride_id: Number(req.params.rideId) },
      orderBy: { timestamp: "asc" },
      include: { sender: { select: { name: true } } },
    });
    res.json(messages.map((m) => ({ ...m, sender_name: m.sender.name })));
  });

  app.post("/api/messages", async (req, res) => {
    const { ride_id, sender_id, receiver_id, content } = req.body;
    try {
      await prisma.message.create({
        data: {
          ride_id: Number(ride_id),
          sender_id: Number(sender_id),
          receiver_id: Number(receiver_id),
          content,
        },
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/inbox/:userId", async (req, res) => {
    const userId = Number(req.params.userId);
    const messages = await prisma.message.findMany({
      where: { OR: [{ sender_id: userId }, { receiver_id: userId }] },
      distinct: ["ride_id"],
      include: {
        ride: { select: { origin: true, destination: true } },
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
    const chats = messages.map((m) => ({
      ride_id: m.ride_id,
      origin: m.ride.origin,
      destination: m.ride.destination,
      other_party_id: m.sender_id === userId ? m.receiver_id : m.sender_id,
      other_party_name:
        m.sender_id === userId ? m.receiver.name : m.sender.name,
    }));
    res.json(chats);
  });

  // ========== RATING ENDPOINTS ==========

  app.post("/api/ratings", async (req, res) => {
    const { ride_id, rater_id, rated_user_id, rating, comment } = req.body;
    try {
      await prisma.rating.create({
        data: {
          ride_id: Number(ride_id),
          rater_id: Number(rater_id),
          rated_user_id: Number(rated_user_id),
          rating: Number(rating),
          comment,
        },
      });
      res.json({ success: true });
    } catch (e: any) {
      if (e.code === "P2002")
        return res
          .status(400)
          .json({ error: "You have already rated this ride" });
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/ratings/:userId", async (req, res) => {
    const userId = Number(req.params.userId);
    const ratings = await prisma.rating.findMany({
      where: { rated_user_id: userId },
      include: { rater: { select: { name: true } } },
    });
    const avg =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
    res.json({
      ratings: ratings.map((r) => ({ ...r, rater_name: r.rater.name })),
      average: avg,
    });
  });

  app.get(
    "/api/ratings/check/:rideId/:raterId/:ratedUserId",
    async (req, res) => {
      const rating = await prisma.rating.findFirst({
        where: {
          ride_id: Number(req.params.rideId),
          rater_id: Number(req.params.raterId),
          rated_user_id: Number(req.params.ratedUserId),
        },
      });
      res.json({ hasRated: !!rating, rating });
    },
  );

  // ========== LOCATION ENDPOINTS ==========

  app.post("/api/locations", async (req, res) => {
    const { ride_id, user_id, latitude, longitude } = req.body;
    try {
      const existing = await prisma.location.findFirst({
        where: { ride_id: Number(ride_id), user_id: Number(user_id) },
      });
      if (existing) {
        await prisma.location.update({
          where: { id: existing.id },
          data: { latitude, longitude },
        });
      } else {
        await prisma.location.create({
          data: {
            ride_id: Number(ride_id),
            user_id: Number(user_id),
            latitude,
            longitude,
          },
        });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/locations/:rideId", async (req, res) => {
    const locations = await prisma.location.findMany({
      where: { ride_id: Number(req.params.rideId) },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(
      locations.map((l) => ({
        ...l,
        user_id: l.user?.id,
        user_name: l.user?.name,
      })),
    );
  });

  // ========== VITE MIDDLEWARE & STATIC FILES ==========

  if (process.env.NODE_ENV !== "production") {
    // Development: Use Vite middleware for HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve built frontend from dist
    app.use(express.static(resolve(__dirname, "dist"), { maxAge: "1h" }));

    // SPA fallback: Route all non-API, non-static requests to index.html
    app.use((req, res, next) => {
      if (!req.path.startsWith("/api/") && !req.path.includes(".")) {
        res.sendFile(resolve(__dirname, "dist/index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgraRide server running on http://localhost:${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
}

startServer().catch(console.error);
