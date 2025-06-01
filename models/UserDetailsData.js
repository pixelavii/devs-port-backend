import mongoose from "mongoose";

const Data = new mongoose.Schema({
  githubName: { type: String},
  githubContribution: { type: String},
  githubRepos: { type: [String]},
  githubProfilePicture: { type: String},
  githubUsername: { type: String},

  linkedinAbout: { type: String},
  linkedinCompany: { type: String},
  linkedinHeadline: { type: String},
  linkedinName: { type: String},
  linkedinProfilePicture: { type: String},
  linkedinSkills: { type: [String]},

  leetCodeBadge: { type: String},
  leetCodeName: { type: String},
  leetCodeRanking: { type: String},
  leetCodeRecentBadge: { type: String},
  leetCodeRecentBadgeHeading: { type: [String]},
  leetCodeRecentSubmission: { type: String},
  leetCodeSolvedProblems: { type: [String]},
  leetCodeSubmission: { type: String},
  leetCodeUsername: { type: String},

  stackOverflowAbout: { type: String},
  stackOverflowBadge1: { type: [String]},
  stackOverflowName: { type: String},
  stackOverflowReputation: { type: String},

  instagramAbout: { type: String},
  instagramFollowers: { type: [String]},
  instagramImgLink: { type: String},
  instagramName: { type: String},

  UserAbout: { type: String, required: true },
  user_ID: { type: String, required: true },
  user_name: { type: String, required: true },
});

export default mongoose.models.SocialData ||
  mongoose.model("SocialData", Data);
