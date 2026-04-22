import connectDB from "../config/database.js";
import { User } from "../models/User.js";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const get = (key) => {
    const idx = args.findIndex((a) => a === key);
    if (idx === -1) return null;
    return args[idx + 1] || null;
  };
  return {
    email: get("--email") || get("-e"),
    demote: args.includes("--demote"),
  };
};

const main = async () => {
  const { email, demote } = parseArgs();

  if (!email) {
    console.error("Usage: node scripts/promote-admin.js --email you@example.com [--demote]");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  user.role = demote ? "user" : "admin";
  await user.save();

  console.log(`Updated role for ${user.email} -> ${user.role}`);
  process.exit(0);
};

main().catch((err) => {
  console.error("Failed to update user role:", err?.message || err);
  process.exit(1);
});


