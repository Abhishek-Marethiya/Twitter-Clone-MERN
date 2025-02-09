import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';


// routes import---
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';
import connection from './db/connection.js';

dotenv.config();
cloudinary.config({ 
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});
const app=express();
const PORT=process.env.SERVER_PORT || 3000;



app.use(cors({
    // origin: 'http://localhost:3030', // local host url where react application is 
	origin:'https://twitter-clone-mern-frontend-phi.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Allow cookies and credentials
}));
// middlewares
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());


// routes
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/notifications',notificationRoutes);


app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connection();
});
