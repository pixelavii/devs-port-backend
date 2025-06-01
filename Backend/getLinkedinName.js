import puppeteer from "puppeteer";

export default async function getLinkedinName(req, res) {
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
}
