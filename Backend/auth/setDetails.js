import SocialDetails from "../../models/UserDetails.js";
import dbConnect from "../../utils/dbConnect.js";

export default async function setDetails(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    await dbConnect();
    const data = req.body;
    const temp = new SocialDetails({
      github: data.github,
      linkedin: data.linkedin,
      leetCode: data.leetCode,
      stackOverflow: data.stackOverflow,
      hackerrank: data.hackerrank,
      instagram: data.instagram,
      facebook: data.facebook,
      about: data.about,
      user_ID: data.userID,
      user_name: data.username,
    });
    await temp.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
