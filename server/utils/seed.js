import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ReliefCenter from "../models/ReliefCenter.js";
import Inventory from "../models/Inventory.js";
import Volunteer from "../models/Volunteer.js";
import Dispatch from "../models/Dispatch.js";
import Log from "../models/Log.js";

const seedDatabase = async () => {
  // Guard: skip if data already exists
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log("Seed skipped — database already has data");
    return;
  }

  const created = {
    users: [],
    centers: [],
    inventory: [],
    volunteers: [],
    dispatches: [],
  };

  try {
    // ── Step 1: Users ──────────────────────────────────────────────
    // insertMany bypasses pre-save hook — hash manually so password is stored correctly
    const passwordHash = await bcrypt.hash("password123", 12);

    created.users = await User.insertMany(
      [
        { name: "Admin User",        email: "admin@relief.org",  password: passwordHash, role: "admin" },
        { name: "Sara Coordinator",  email: "sara@relief.org",   password: passwordHash, role: "coordinator" },
        { name: "James Volunteer",   email: "james@relief.org",  password: passwordHash, role: "volunteer" },
        { name: "Aisha Volunteer",   email: "aisha@relief.org",  password: passwordHash, role: "volunteer" },
        { name: "Carlos Volunteer",  email: "carlos@relief.org", password: passwordHash, role: "volunteer" },
      ],
      { ordered: true }
    );
    console.log(`✓ ${created.users.length} users inserted`);

    // ── Step 2: Relief Centers ─────────────────────────────────────
    created.centers = await ReliefCenter.insertMany(
      [
        {
          name: "North Hub Alpha",
          location: { type: "Point", coordinates: [77.209, 28.6139], lat: 28.6139, lng: 77.209 },
          capacity: 500,
          currentLoad: 420,
          contactInfo: "+1-800-111-0001",
          status: "active",
        },
        {
          name: "South Relief Base",
          location: { type: "Point", coordinates: [80.2707, 13.0827], lat: 13.0827, lng: 80.2707 },
          capacity: 300,
          currentLoad: 300,
          contactInfo: "+1-800-111-0002",
          status: "full",
        },
        {
          name: "East Emergency Camp",
          location: { type: "Point", coordinates: [88.3639, 22.5726], lat: 22.5726, lng: 88.3639 },
          capacity: 400,
          currentLoad: 120,
          contactInfo: "+1-800-111-0003",
          status: "active",
        },
        {
          name: "West Aid Station",
          location: { type: "Point", coordinates: [72.8777, 19.076], lat: 19.076, lng: 72.8777 },
          capacity: 250,
          currentLoad: 0,
          contactInfo: "+1-800-111-0004",
          status: "inactive",
        },
      ],
      { ordered: true }
    );
    console.log(`✓ ${created.centers.length} relief centers inserted`);

    // ── Step 3: Inventory ──────────────────────────────────────────
    const [c0, c1, c2] = created.centers;

    created.inventory = await Inventory.insertMany(
      [
        { itemName: "Rice (50kg bags)", category: "food", quantity: 15, threshold: 20, centerId: c0._id },
        { itemName: "Drinking Water (5L)", category: "water", quantity: 200, threshold: 100, centerId: c0._id },
        { itemName: "First Aid Kits", category: "medicine", quantity: 8, threshold: 15, centerId: c0._id },
        { itemName: "Blankets", category: "shelter", quantity: 50, threshold: 30, centerId: c0._id },
        { itemName: "Canned Food", category: "food", quantity: 5, threshold: 25, centerId: c1._id },
        { itemName: "Oral Rehydration Salts", category: "medicine", quantity: 3, threshold: 10, centerId: c1._id },
        { itemName: "Tarpaulins", category: "shelter", quantity: 40, threshold: 20, centerId: c1._id },
        { itemName: "Antibiotics", category: "medicine", quantity: 60, threshold: 20, centerId: c2._id },
        { itemName: "Baby Formula", category: "food", quantity: 12, threshold: 10, centerId: c2._id },
        { itemName: "Generators", category: "equipment", quantity: 2, threshold: 1, centerId: c2._id },
      ],
      { ordered: true }
    );
    console.log(`✓ ${created.inventory.length} inventory items inserted`);

    // ── Step 4: Volunteers ─────────────────────────────────────────
    // Validate user refs exist before inserting
    const volunteerUsers = created.users.filter((u) => u.role === "volunteer");

    created.volunteers = await Volunteer.insertMany(
      [
        {
          userId: volunteerUsers[0]._id,
          skills: ["first aid", "logistics", "driving"],
          currentLocation: { type: "Point", coordinates: [77.209, 28.6139] },
          availability: "available",
        },
        {
          userId: volunteerUsers[1]._id,
          skills: ["medical", "triage", "communication"],
          currentLocation: { type: "Point", coordinates: [80.2707, 13.0827] },
          availability: "available",
        },
        {
          userId: volunteerUsers[2]._id,
          skills: ["construction", "heavy lifting", "cooking"],
          currentLocation: { type: "Point", coordinates: [88.3639, 22.5726] },
          availability: "offline",
        },
      ],
      { ordered: true }
    );
    console.log(`✓ ${created.volunteers.length} volunteers inserted`);

    // ── Step 5: Dispatches ─────────────────────────────────────────
    // Validate volunteer and center refs exist
    const [v0, v1] = created.volunteers;

    created.dispatches = await Dispatch.insertMany(
      [
        {
          volunteerId: v0._id,
          centerId: c0._id,
          taskType: "Food distribution",
          priority: "high",
          status: "assigned",
        },
        {
          volunteerId: v1._id,
          centerId: c1._id,
          taskType: "Medical triage support",
          priority: "critical",
          status: "pending",
        },
      ],
      { ordered: true }
    );
    console.log(`✓ ${created.dispatches.length} dispatches inserted`);

    // Mark assigned volunteers as busy
    await Volunteer.findByIdAndUpdate(v0._id, {
      availability: "busy",
      $push: { assignedTasks: created.dispatches[0]._id },
    });

    // ── Step 6: Seed log ───────────────────────────────────────────
    await Log.create({
      action: "DATABASE_SEEDED",
      user: created.users[0]._id,
      metadata: {
        users: created.users.length,
        centers: created.centers.length,
        inventory: created.inventory.length,
        volunteers: created.volunteers.length,
        dispatches: created.dispatches.length,
      },
    });

    console.log("✅ Database seeded successfully");
    console.log("─────────────────────────────────────");
    console.log("  Login credentials (all use password123):");
    console.log("  admin@relief.org       → admin");
    console.log("  sara@relief.org        → coordinator");
    console.log("  james@relief.org       → volunteer");
    console.log("─────────────────────────────────────");

  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    console.log("🔁 Rolling back inserted documents...");

    // Manual rollback in reverse order to respect references
    if (created.dispatches.length)
      await Dispatch.deleteMany({ _id: { $in: created.dispatches.map((d) => d._id) } });

    if (created.volunteers.length)
      await Volunteer.deleteMany({ _id: { $in: created.volunteers.map((v) => v._id) } });

    if (created.inventory.length)
      await Inventory.deleteMany({ _id: { $in: created.inventory.map((i) => i._id) } });

    if (created.centers.length)
      await ReliefCenter.deleteMany({ _id: { $in: created.centers.map((c) => c._id) } });

    if (created.users.length)
      await User.deleteMany({ _id: { $in: created.users.map((u) => u._id) } });

    console.log("🔁 Rollback completed");
    throw err;
  }
};

export default seedDatabase;
