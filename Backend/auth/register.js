import dbConnect from "../../utils/dbConnect.js";
import User from "../../models/User.js";

export default async function register(req, res) {
  await dbConnect();
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}