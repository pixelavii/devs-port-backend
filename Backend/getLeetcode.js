import puppeteer from "puppeteer";

export default async function getLeetCodeProfile(req, res) {
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
}

// "div.text-label-1.dark:text-dark-label-1.break-all.text-base.font-semibold"
