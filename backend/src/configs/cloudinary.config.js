import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

export const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('Successfully connected to Cloudinary');
  } catch (error) {
    console.log(error)
    console.log("Error connecting to Cloudinary:", error.message);
    process.exit(1); // Exit process with failure
  }
};