import dbConnect from "../../utils/dbConnect.js";
import SocialDetails from "../../models/UserDetails.js";

export default async function getDb(req, res) {
  if (req.method === "POST") {
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
  }
}
