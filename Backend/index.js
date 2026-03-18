import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import contentRoutes from "./src/routes/contentRoutes.js";
import seedDatabase from "./src/seed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);

connectDB().then(async () => {
    // Seed DB automatically for the hackathon MVP
    try {
        await seedDatabase();
    } catch (err) {
        console.error("Database Seeding Error:", err);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("MongoDB Connection Error: ", err);
});
