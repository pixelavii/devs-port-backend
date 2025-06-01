import puppeteer from "puppeteer";

export default async function getGithub(req, res) {
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
}
