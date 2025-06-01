import dbConnect from "../../utils/dbConnect.js";
import SocialData from '../../models/UserDetailsData.js';

export default async function RegisterData(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body.combinedData;

    const transformToStringArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((item) =>
          typeof item === "object" && item.text ? item.text : item
        );
      }
      return [value];
    };

    const userDetailsData = new SocialData({
      githubName: data.Github.fullName || "N/A",
      githubContribution: data.Github.gitContribution || "N/A",
      githubRepos: transformToStringArray(data.Github.gitrepo),
      githubProfilePicture: data.Github.profilePicture || "",
      githubUsername: data.Github.username || "",

      linkedinAbout:
        data.LinkedIn && data.LinkedIn[0] ? data.LinkedIn[0].userLinkedinabout : "N/A",
      linkedinCompany:
        data.LinkedIn && data.LinkedIn[0] ? data.LinkedIn[0].company : "N/A",
      linkedinHeadline:
        data.LinkedIn && data.LinkedIn[0]
          ? data.LinkedIn[0].headlineAbout
          : "N/A",
      linkedinName:
        data.LinkedIn && data.LinkedIn[0] ? data.LinkedIn[0].name : "N/A",
      linkedinProfilePicture:
        data.LinkedIn && data.LinkedIn[0]
          ? data.LinkedIn[0].profilePicture
          : "",
      linkedinSkills: Array.isArray(data.LinkedIn[1].skills)
        ? data.LinkedIn[1].skills.map((skill) =>
            typeof skill === "object" && skill.text ? skill.text : skill
          )
        : typeof data.LinkedIn[1].skills === "object" &&
            data.LinkedIn[1].skills.text
          ? [data.LinkedIn[1].skills.text]
          : [data.LinkedIn[1].skills],

      leetCodeBadge: data.LeetCode.badge || "N/A",
      leetCodeName: data.LeetCode.fullName || "N/A",
      leetCodeRanking: data.LeetCode.ranking || "N/A",
      leetCodeRecentBadge: data.LeetCode.recentBadge || "N/A",
      leetCodeRecentBadgeHeading: transformToStringArray(
        data.LeetCode.recentBadgeHeading
      ),
      leetCodeRecentSubmission: data.LeetCode.recentSubmission || "N/A",
      leetCodeSolvedProblems: transformToStringArray(
        data.LeetCode.solvedProblems
      ),
      leetCodeSubmission: data.LeetCode.submission || "N/A",
      leetCodeUsername: data.LeetCode.username || "N/A",

      stackOverflowAbout: data.StackOverflow.stackAbout || "N/A",
      stackOverflowBadge1: transformToStringArray(data.StackOverflow.badge1),
      stackOverflowName: data.StackOverflow.fullName || "N/A",
      stackOverflowReputation: data.StackOverflow.reputation || "N/A",

      instagramAbout: data.Instagram.About || "N/A",
      instagramFollowers: transformToStringArray(data.Instagram.Followers),
      instagramImgLink: data.Instagram.ImgLink || "",
      instagramName: data.Instagram.Name || "N/A",

      UserAbout: data.UserData && data.UserData[0] ? data.UserData[0].about : "N/A",
      user_ID:
        data.UserData && data.UserData[0] ? data.UserData[0].user_ID : "",
      user_name:
        data.UserData && data.UserData[0] ? data.UserData[0].user_name : "",
    });
    await userDetailsData.save();
    return res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.log("Error saving data:", error);
    return res.status(500).json({ message: error.message });
  }
}
