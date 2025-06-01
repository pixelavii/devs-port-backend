import puppeteer from "puppeteer";

export default async function getStackOverflowProfile(req, res) {
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
}
