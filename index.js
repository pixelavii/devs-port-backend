import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import SocialData from './models/UserDetailsData.js';
import SocialDetails from './models/UserDetails.js';
import dbConnect from "./utils/dbConnect.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
// import helmet from "helmet";
// import compression from "compression";
// import morgan from "morgan";
import mongoose from 'mongoose';




const secret = process.env.JWT_SECRET || "secret_key";
dotenv.config();

const app = express();


// const allowedOrigins = ['https://devsport.vercel.app/', 'http://localhost:3000'];
app.use(cors());
app.use(express.json());
// app.use(helmet());
// app.use(compression());
// app.use(morgan("combined"));



// getDetails Function
app.post('/api/auth/getDetails', async (req, res) => {
    try {
        const ID = req.body.userID;
        await dbConnect();
        const data = await SocialDetails.find();
        const filterData = data.filter((data) => data.user_ID === ID);
        const Social = await SocialData.find();
        const SocialFilter = Social.filter((data) => data.user_ID === ID);
        return res.status(200).send({ filterData, SocialFilter });
    } catch (err) {
        return res.status(200).json({ message: "Login First" });
    }
})


// login Function
app.post('/api/auth/login', async (req, res) => {

    console.log(req.body);
    console.log("Step 1")
    mongoose.set('strictQuery', true);
    console.log("Step 2");
    await dbConnect();
    console.log("Step 3");
    if (req.method !== "POST") {
        console.log("Step End")
        return res.status(405).json({ message: "Method not allowed" });
    }
    try {
        console.log("Step 4")
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        console.log(user)
        console.log("Step 5")
        if (!user) return res.status(404).json({ message: "User not found" });
        console.log("Step 6")
        const isMatch = await user.comparePassword(password);
        console.log("Step 7")
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1h" });
        console.log("Step 8")
        const id = user._id.toString(); //Here we get the user id.
        console.log("Step 9")
        return res.status(200).send({ token, id, user: user.username });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


// register Function
app.post('/api/auth/register', async (req, res) => {
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
})


// setDetails Function
app.post('/api/auth/setDetails', async (req, res) => {
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
})


// getDb Function
app.post('/api/auth/getDb', async (req, res) => {
    try {
        const ID = req.body.userID;
        await dbConnect();
        const data = await SocialDetails.find();
        const Checked = data.filter((data) => data.user_ID === ID);
        if (Checked.length === 0) {
            return res.status(200).send({ Checked: false });
        } else {
            return res.status(200).send({ Checked: true });
        }
    } catch (err) {
        return res.status(200).json({ message: "Login First" });
    }
})


// registerData Fuction
app.post('/api/auth/registerData', async (req, res) => {
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
})


// getLeetCodeProfile Function  
app.post('/api/getLeetcode', async (req, res) => {
    if (req.method === "POST") {
        try {
            const leetcodeProfile = req.body.leetcodeData;
            // Launch Puppeteer in headless mode
            const browser = await puppeteer.launch({
                headless: false,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = await browser.newPage();

            // Navigate to the user's LeetCode profile page
            await page.goto(`https://leetcode.com/${leetcodeProfile}/`, {
                waitUntil: "networkidle2",
            });

            const profileData = await page.evaluate(() => {
                const fullNameElement = document.querySelector(
                    ".text-label-1.break-all.text-base.font-semibold"
                );
                const usernameElement = document.querySelector(
                    "div.text-label-3.text-xs"
                );
                const solvedProblemsElement = document.querySelectorAll(
                    "div.text-sd-foreground.text-xs.font-medium"
                );
                const rankingElement = document.querySelector("span.ttext-label-1");
                const badgeElement = document.querySelector(
                    "div.flex.items-start.justify-between div"
                );
                const submissionElement = document.querySelector(
                    "div.flex.flex-1.items-center span"
                );
                const recentBadgeElementHeading = document.querySelectorAll(
                    "div.bg-layer-1.shadow-down-01.rounded-lg.w-full.flex-1 div.p-4 div.text-label-3.text-xs"
                );
                const recentBadgeElement = document.querySelector(
                    "div.bg-layer-1.shadow-down-01.rounded-lg.w-full.flex-1 div.p-4 div.text-label-1.text-base"
                );
                const recentSubmissionElement = document.querySelector(
                    "div.bg-layer-1.shadow-down-01.rounded-lg.flex.h-auto.flex-col.space-y-4.p-4.pb-0 div.flex.flex-col.flex-wrap.space-y-2 div.flex.flex-1.items-center span"
                );

                return {
                    fullName: fullNameElement ? fullNameElement.innerText.trim() : null,
                    username: usernameElement ? usernameElement.innerText.trim() : null,
                    solvedProblems:
                        solvedProblemsElement && solvedProblemsElement.length
                            ? Array.from(solvedProblemsElement).map((solve) => ({
                                text: solve.innerText.trim(),
                            }))
                            : null,
                    ranking: rankingElement ? rankingElement.innerHTML : null,
                    badge: badgeElement ? badgeElement.innerText.trim() : null,
                    submission: submissionElement
                        ? submissionElement.innerText.trim()
                        : null,
                    recentBadge: recentBadgeElement
                        ? recentBadgeElement.innerText.trim()
                        : null,
                    recentBadgeHeading:
                        recentBadgeElementHeading && recentBadgeElementHeading.length
                            ? Array.from(recentBadgeElementHeading).map((solve) => ({
                                text: solve.innerText.trim(),
                            }))
                            : null,
                    recentSubmission: recentSubmissionElement
                        ? recentSubmissionElement.innerText.trim()
                        : null,
                };
            });

            await browser.close();
            return res.status(200).json({ profile: profileData });
        } catch (err) {
            console.error("Error scraping LeetCode profile:", err);
            return res
                .status(500)
                .json({ message: "Can't fetch data from LeetCode" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
});


// getInstagramProfile Function
app.post('/api/getInstagram', async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Get the Instagram profile URL from the request body
        const profileLink = req.body.instagramData;

        // Launch Puppeteer (headless mode is true for production)
        const browser = await puppeteer.launch({
            headless: true, // Use false for debugging; switch to true in production
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Navigate to Instagram's login page
        await page.goto("https://www.instagram.com/accounts/login/", {
            waitUntil: "networkidle2",
        });

        // Wait for the login form to appear
        await page.waitForSelector("input[name='username']");
        await page.waitForSelector("input[name='password']");

        // Enter login credentials (use environment variables for security)
        await page.type("input[name='username']", process.env.INSTAGRAM_USERNAME, {
            delay: 50,
        });
        await page.type("input[name='password']", process.env.INSTAGRAM_PASSWORD, {
            delay: 50,
        });

        // Click the login button (Instagram's login button is typically a submit button)
        await page.click("button[type='submit']");

        // Wait for navigation after login (you might need to adjust the wait condition)
        await page.waitForNavigation({ waitUntil: "networkidle2" });

        // Navigate to the user's Instagram profile page
        await page.goto(`https://www.instagram.com/${profileLink}`, {
            waitUntil: "networkidle2",
        });

        // Scrape desired data – here, for example, we extract the profile picture URL
        const profileData = await page.evaluate(() => {
            const nameElement = document.querySelector(
                "span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.x1s688f.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj"
            );
            const aboutElement = document.querySelector("span._ap3a._aaco");
            const followersElement = document.querySelectorAll(
                "span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xl565be.xo1l8bm.x1roi4f4.x2b8uid.x10wh9bi.x1wdrske.x8viiok.x18hxmgj"
            );
            const imgElement = document.querySelector(
                "img.xpdipgo.x972fbf.xcfux6l.x1qhh985.xm0m39n.xk390pu.x5yr21d.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xl1xv1r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x11njtxf.xh8yej3"
            );

            return {
                Name: nameElement ? nameElement.innerText.trim() : null,
                About: aboutElement ? aboutElement.innerText.trim() : null,
                Followers:
                    followersElement && followersElement.length
                        ? Array.from(followersElement).map((follower) => ({
                            text: follower.innerText.trim(),
                        }))
                        : null,
                ImgLink: imgElement ? imgElement.getAttribute("src") : null,
            };
        });

        // console.log(profileData);
        await browser.close();

        return res.status(200).json({ profileData });
    } catch (err) {
        console.error("Scraping Error:", err);
        return res.status(500).json({ message: "Error scraping data" });
    }
});


// getStackOverflowProfile Function
app.post('/api/getStackOverflow', async (req, res) => {
    if (req.method === "POST") {
        try {
            const stackOverflowProfileUrl = req.body.stackoverflowData;

            // Launch Puppeteer in headless mode for production
            const browser = await puppeteer.launch({
                headless: true,
                // Uncomment and adjust the args if needed:
                // args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Navigate to the StackOverflow profile page
            await page.goto(stackOverflowProfileUrl, { waitUntil: "networkidle2" });


            const profileData = await page.evaluate(() => {
                const fullNameElement = document.querySelector("div.flex--item.mb12.fs-headline2.lh-xs");
                const reputationElement = document.querySelector("ul.s-anchors__inherit");
                const aboutElement = document.querySelector("div.flex__allitems6");
                const badge1Element = document.querySelectorAll("div.fs-title.fw-bold.fc-black-600");

                return {
                    fullName: fullNameElement ? fullNameElement.innerText.trim() : null,
                    reputation: reputationElement ? reputationElement.innerText.trim() : null,
                    stackAbout: aboutElement ? aboutElement.innerText.trim() : null,
                    badge1:
                        badge1Element && badge1Element.length
                            ? Array.from(badge1Element).map((badge) => ({
                                text: badge.innerText.trim(),
                            }))
                            : null,
                };
            });

            await browser.close();
            return res.status(200).json({ profile: profileData });
        } catch (err) {
            console.error("Error scraping StackOverflow profile:", err);
            return res.status(500).json({ message: "Can't fetch data from StackOverflow" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
});


// getGithub Function
app.post('/api/getGithub', async (req, res) => {
    if (req.method === "POST") {
        try {
            const githubProfile = req.body.gitData;

            // Launch Puppeteer (headless mode is true for production)
            const browser = await puppeteer.launch({
                headless: true,
                // args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // Navigate to the GitHub profile page and wait until the network is idle
            await page.goto(`https://github.com/${githubProfile}`, {
                waitUntil: "networkidle2",
            });

            const gitData = await page.evaluate(() => {
                const profilePictureElement = document.querySelector("img.avatar-user");
                const fullNameElement = document.querySelector("span.p-name");
                const usernameElement = document.querySelector("span.p-nickname");
                const bioElement = document.querySelector("div.p-note");
                const repos = document.querySelectorAll(
                    ".pinned-item-list-item-content div span a"
                );
                const contribution = document.querySelector(".js-yearly-contributions div h2");

                return {
                    profilePicture: profilePictureElement
                        ? profilePictureElement.src
                        : null,
                    fullName: fullNameElement ? fullNameElement.innerText.trim() : null,
                    username: usernameElement ? usernameElement.innerText.trim() : null,
                    bio: bioElement ? bioElement.innerText.trim() : null,
                    gitContribution: contribution ? contribution.innerText.trim() : null,
                    gitrepo:
                        repos && repos.length
                            ? Array.from(repos).map((repo) => ({
                                text: repo.innerText.trim(),
                            }))
                            : null,
                };
            });

            await browser.close();
            return res.status(200).json({ profile: gitData });
        } catch (err) {
            console.error("Error scraping GitHub profile:", err);
            return res.status(500).json({ message: "Can't fetch data from GitHub" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
});


// getLinkedinName Function
app.post('/api/getLinkedinName', async (req, res) => {
    if (req.method === "POST") {
        try {
            const imgLink = req.body.linkedinData;

            // Launch Puppeteer in headless mode. Adjust args as necessary.
            console.log(imgLink)
            console.log("Step 1");
            const browser = await puppeteer.launch({
                headless: true,
                // args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = await browser.newPage();

            // Navigate to LinkedIn's login page
            console.log("Step 2");
            await page.goto("https://www.linkedin.com/login", {
                waitUntil: "networkidle2",
            });

            // Enter login credentials
            console.log("Step 3");
            await page.type("#username", process.env.LINKEDIN_USERNAME, {
                delay: 50,
            });
            await page.type("#password", process.env.LINKEDIN_PASSWORD, {
                delay: 50,
            });

            console.log("Step 4");
            await Promise.all([
                page.click('button[type="submit"]', { delay: 100 }),
                // page.waitForNavigation({ waitUntil: 'networkidle2' }),
            ]);
            console.log("Step 4.1");

            console.log("Step 6");
            await page.goto(imgLink);

            // Scrape the desired profile data. The selectors may need adjustment as LinkedIn updates its DOM.
            console.log("Step 7");
            const profileData = await page.evaluate(() => {
                const imgElement = document.querySelector(
                    ".pv-top-card-profile-picture__image--show"
                );
                const headlineElement = document.querySelector(
                    ".inline-show-more-text--is-collapsed-with-line-clamp"
                );
                const aboutElement = document.querySelector(
                    ".inline-show-more-text--is-collapsed-with-line-clamp span"
                );
                const headlineAboutElement =
                    document.querySelector(".text-body-medium");

                return {
                    profilePicture: imgElement ? imgElement.getAttribute("src") : null,
                    name: imgElement ? imgElement.getAttribute("alt") : null,
                    company: headlineElement ? headlineElement.innerText.trim() : null,
                    userLinkedinabout: aboutElement ? aboutElement.innerText.trim() : null,
                    headlineAbout: headlineAboutElement
                        ? headlineAboutElement.innerText.trim()
                        : null,
                };
            });
            // console.log(profileData);

            console.log("Step 8");
            await page.goto(`${imgLink}/details/skills/`);
            const profileSkillData = await page.evaluate(() => {
                const skillsElement = document.querySelectorAll(
                    "li.pvs-list__paged-list-item.artdeco-list__item.pvs-list__item--line-separated.pvs-list__item--one-column div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span.visually-hidden"
                );

                return {
                    skills:
                        skillsElement && skillsElement.length
                            ? Array.from(skillsElement).map((skill) => ({
                                text: skill.innerText.trim(),
                            }))
                            : null,
                };
            });
            // console.log(profileSkillData);

            await browser.close();

            return res.status(200).send({ profile: profileData, LinkedinSkill: profileSkillData });
        } catch (err) {
            return res
                .status(500)
                .json({ message: "Can't fetch data from linkedin" });
        }
    }
});




const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
