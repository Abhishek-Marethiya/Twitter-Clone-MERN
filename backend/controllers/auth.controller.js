import User from '../models/user.model.js';
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from "../utils/generateToken.js";


export const signup = async (req,res)=>{
	
     try {
	
        const { fullName, username, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}
         
		  
        const existingUser = await User.findOne({ username });
		if (existingUser) {
            // console.log("Username is already taken");
			return res.status(400).json({ error: "Username is already taken" });
		}
      
        const existingEmail = await User.findOne({ email });
		if (existingEmail) {
            // console.log("Email is already taken");
			return res.status(400).json({ error: "Email is already taken" });
		}

        if (password.length < 6) {
            // console.log("Password must be at least 6 characters long");
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

        const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});
        
        if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();
            // console.log("user created succesfully");
			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
        
     } catch (error) {
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" })
     }
}

export const login=async (req,res)=>{
    try {
		const { username, password } = req.body;
		console.log(username);
		
		if (!username || !password) {
			return res.status(400).json({ error: "Both username and password are required." });
		  }
		  const user = await User.findOne({username});
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const logout=async (req,res)=>{
	
    try {
		const token=req.cookies.jwt;
		console.log(token);
		
		res.cookie("jwt", "", { maxAge: 0 });
		// res.clearCookie("token");
		
		res.status(200).json({ message: "Logged out successfully" });    
		console.log("Logged out successfully");
		
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
} 

export const getMe= async(req,res)=>{
	
	try {
		const user = await User.findById(req.user._id).select("-password");  //user detail excluding password
		res.status(200).json(user); //Sends the retrieved data as a JSON response to the client.
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}