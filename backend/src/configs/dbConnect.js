import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnect = async () => {
    const MONGO_URL = process.env.MONGODB_URI;

    if (!MONGO_URL) {
        console.error("MONGO_URL is missing! Check your .env file.");
        process.exit(1);
    }


    try {
        console.log("MONGO_URL from .env:", process.env.MONGO_URL);
        const mongoDbConnection = await mongoose.connect(MONGO_URL);

        console.log(`Database Connected Successfully: ${mongoDbConnection.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

export default dbConnect;
