import dbConnect from "../../utils/dbConnect.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "secret_key";

export default async function login(req, res) {
  await dbConnect();
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1h" });
    const id = user._id.toString(); //Here we get the user id.
    return res.status(200).send({ token, id, user: user.username });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}