import express, { json, urlencoded } from "express";
import dbConnect from "./configs/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import myPostRoutes from './routes/myPostRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import eventRoutes from './routes/eventRoutes.js'
import walletRoutes from "./routes/walletRoutes.js";
import exploreRoutes from './routes/exploreRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import searchbarRoutes from './routes/searchbarRoutes.js';
import avaiabilityRoutes from './routes/availabilityRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import speakerProfileRoutes from './routes/speakerProfileRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import enhancedProfileRoutes from './routes/enhancedProfileRoutes.js';
import enhancedPostRoutes from './routes/enhancedPostRoutes.js';
import workExperienceRoutes from './routes/workExperienceRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import awardRoutes from './routes/awardRoutes.js';
import featuredVideoRoutes from './routes/featuredVideoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import Message from './models/message.js';
import cors from "cors";
import session from "express-session";
import corsMiddleware from "./middleware/cors.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./configs/passportConfig.js";
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

import dotenv from "dotenv";
import { connectCloudinary } from "./configs/cloudinary.config.js";
import transporter from "./configs/nodemailer.config.js";
dotenv.config();

console.log('=== BACKEND STARTUP DEBUG ===');
console.log('🚀 Starting backend server...');
console.log('📊 Database connection status:', 'Connecting...');

dbConnect().then(() => {
  console.log('✅ Database connected successfully');
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

connectCloudinary();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', async (data) => {
    const { sender, receiver, content } = data;

    const message = new Message({ sender, receiver, content });
    await message.save();

    io.to(receiver).emit('receive_message', message);
  });

  socket.on('join', (userId) => {
    socket.join(userId); // Join user-specific room
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5000", "http://localhost"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle pre-flight requests
app.options('*', cors(corsOptions));

// Apply custom CORS middleware for extra header control
app.use(corsMiddleware);

// Increase JSON payload size limit for video uploads
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ limit: "50mb", extended: "true" }));

app.use(session({
  secret: process.env.SESSION_SECRET || "sessSecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    // For development, don't require HTTPS
    secure: false, // Set to process.env.NODE_ENV === 'production' in production
    httpOnly: true,
    sameSite: 'lax', // Use 'none' in production with secure:true
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", otpRoutes); // OTP routes under auth namespace
app.use("/api/post", postRoutes);
app.use("/api/my-post", myPostRoutes);
app.use("/api/comment", commentRoutes);
app.use('/api/events', eventRoutes);
app.use("/api/wallet", walletRoutes);
app.use('/api/explore', exploreRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchbarRoutes);
app.use("/api/availability", avaiabilityRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/speaker-profile", speakerProfileRoutes);
app.use("/api/enhanced-profile", enhancedProfileRoutes);
app.use("/api/enhanced-posts", enhancedPostRoutes);
app.use("/api/work-experience", workExperienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/awards", awardRoutes);

// Featured videos and upload routes
app.use("/api/featured-videos", featuredVideoRoutes);
app.use("/api/upload", uploadRoutes);


// SMS routes
app.use("/api/sms", smsRoutes);

app.get('/', (req, res) => {
    res.send("VVS Website")
})

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log('=== SERVER STARTUP COMPLETE ===');
    console.log(`🚀 Server Is Running On Port : ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`📡 Feed Endpoint: http://localhost:${PORT}/api/enhanced-posts/feed`);
    console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/enhanced-posts/test`);
    console.log(`🗄️  DB Test Endpoint: http://localhost:${PORT}/api/enhanced-posts/db-test`);
    console.log('===============================');
});