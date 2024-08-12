import mongoose from "mongoose";
import dotenv from "dotenv";
// import path from "path";
// import {fileURLToPath} from "url";

// // configuring path to environment variables
// const __filename = fileURLToPath(import.meta.url); // points to current file
// const __dirname = path.dirname(__filename); // points to the current directory
// const envPath = path.resolve(__dirname, "../../.env")
// dotenv.config({path: envPath})
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000
        })
        console.log("MongoDB connected successfully.")
    }
    catch(error) {
        console.log(error)
        process.exit(1)
    }
};

export default connectDB;