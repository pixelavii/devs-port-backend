import dbConnect from "../../utils/dbConnect.js";
import SocialDetails from "../../models/UserDetails.js";
import SocialData from "../../models/UserDetailsData.js";


export default async function getDetails(req, res) {

    if (req.method === "POST") {
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
    }
}