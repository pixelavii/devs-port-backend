import puppeteer from "puppeteer";

export default async function getInstagramProfile(req, res) {

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
}
