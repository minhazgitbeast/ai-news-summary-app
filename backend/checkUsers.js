import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ai-news-summary";

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({}).select("_id name email summaries");
    console.log(`Found ${users.length} users in database:`);

    users.forEach((user) => {
      console.log(`- ID: ${user._id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Summaries count: ${user.summaries.length}`);
      console.log("---");
    });

    if (users.length === 0) {
      console.log("No users found. Creating a test user...");
      const testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        summaries: [
          {
            originalText: "This is a test article about AI.",
            summary: "Test summary about AI technology.",
            keywords: ["AI", "technology", "test"],
          },
        ],
      });

      await testUser.save();
      console.log(`Created test user with ID: ${testUser._id}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkUsers();
