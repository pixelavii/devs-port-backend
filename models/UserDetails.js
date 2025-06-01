import mongoose from "mongoose";

const Details = new mongoose.Schema({
  github: { type: String, required: true },
  linkedin: { type: String, required: true },
  leetCode: { type: String, required: true },
  stackOverflow: { type: String, required: true },
  hackerrank: { type: String, required: true },
  instagram: { type: String, required: true },
  facebook: { type: String, required: true },
  about: { type: String, required: true },
  user_ID: { type: String, required: true },
  user_name: { type: String, required: true },
});

export default mongoose.models.SocialDetails ||
  mongoose.model("SocialDetails", Details);
