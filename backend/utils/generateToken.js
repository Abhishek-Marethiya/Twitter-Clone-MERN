import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
		httpOnly: true, // Prevent XSS attacks
		sameSite: "none", // Required for cross-origin cookies
		secure: true, //  Required for HTTPS on Vercel
	});
};
