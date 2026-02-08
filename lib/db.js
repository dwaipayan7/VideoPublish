import { config } from "dotenv";
import mongoose from "mongoose";
config()

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB)
        console.log(`Database connected ${conn.connection.host}`);

    } catch (error) {
        console.log("Error connection with database", error);
        process.exit(1)

    }
}