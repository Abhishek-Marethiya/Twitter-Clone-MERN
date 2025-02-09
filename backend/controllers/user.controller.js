import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
//models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {   
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });
		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {    
	try {
		// Retrieve the user ID to follow/unfollow from the URL parameters
		const { id } = req.params;

		// Find the user to modify (the user being followed/unfollowed)  //jsiko current user follow karenga ki unfollow (jiski id aa rhi h)
		const userToModify = await User.findById(id);

		// Find the current logged-in user (from the JWT token attached to req.user)
		const currentUser = await User.findById(req.user._id);

		// Check if the current user is trying to follow/unfollow themselves
		if (id === req.user._id.toString()) {  //user.id is in form of object so convert in string like id

            // Return an error response if the user is trying to follow/unfollow themselves
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		// If the user to modify or the current user doesn't exist, return an error
		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		// Check if the current user is already following the user to modify
		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// If already following, unfollow the user
			// Remove current user from the followers list of the user to modify
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

			// Remove the user to modify from the current user's following list
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			// Respond with a success message for unfollowing
			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// If not following, follow the user
			// Add current user to the followers list of the user to modify
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

			// Add the user to modify to the current user's following list
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

			// Optionally, you can send a follow notification 
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});
			await newNotification.save();  // SAVING TO DATABASE

			// Respond with a success message for following
			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		// If there's an error during the process, log it and return an error response
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


//showed on side bar
export const getSuggestedUsers = async (req, res) => {
	try {
		// Step 1: Get the logged-in user's ID from req.user
		const userId = req.user._id;
		console.log(req.user);
		

		// Step 2: Fetch the list of users that the logged-in user is already following
		// This is to exclude them from the "suggested users" list later
		const usersFollowedByMe = await User.findById(userId).select("following");

		// Step 3: Use MongoDB Aggregation to get random users from the database
		const users = await User.aggregate([
			{
				$match: {
					// Exclude the current user (userId) from the results
					_id: { $ne: userId },
				},
			},
			// Randomly select 10 users (this is for performance optimization)
			{ $sample: { size: 10 } },
		]);

		// Step 4: Filter out users that are already followed by the logged-in user
		const filteredUsers = users.filter(
			(user) => !usersFollowedByMe.following.includes(user._id)
		);

		// Step 5: Select up to 4 users from the filtered list to suggest
		const suggestedUsers = filteredUsers.slice(0, 4);

		// Step 6: Remove the password field for security purposes (optional)
		suggestedUsers.forEach((user) => (user.password = null));

		// Step 7: Send the suggested users list as a response
		res.status(200).json(suggestedUsers);
	} catch (error) {
		// Error handling: Log the error and send a 500 response
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const updateUserProfile= async (req,res)=>{


	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let{profileImg, coverImg}=req.body;

	const userId=req.user._id;

	try {
		let user=await User.findById(userId);
		if(!user) return res.status(404).json({message:"User not found"});
		if((currentPassword && !newPassword) || (!currentPassword && newPassword)){
			return res.status(404).json({error:"Please Provide both current password and new password"});
		}
		
		 if(currentPassword && newPassword){
			const isMatch=await bcrypt.compare(currentPassword,user.password);
			if(!isMatch) return res.status(400).json({error:"Invalid password"});
		    if(newPassword.length<6) return res.status(400).json({error:"Password must be alteat 6 character long"}); 

			const salt=await bcrypt.genSalt(10);
			//new password ko hash krke old password se replace kr diya
			user.password=await bcrypt.hash(newPassword,salt);
		}
		if(profileImg){ 
			if (user.profileImg) {  
				//to delete prvious img from cloudinary
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}
			const uploadResult = await cloudinary.uploader.upload(profileImg);
			profileImg=uploadResult.secure_url;
		}
		if(coverImg){
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}
			const uploadResult = await cloudinary.uploader.upload(coverImg);
			coverImg=uploadResult.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;
         
		user= await user.save();
         user.password=null; //ye bs yhi change hoga database me nhi kyoki iske baad user.save nhi kiya h.
		return res.status(200).json({user});

	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}

   
}