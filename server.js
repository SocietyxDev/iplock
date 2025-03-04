const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

app.post("/generate-cookie", (req, res) => {
    const { cookie } = req.body;

    if (!cookie) {
        return res.json({ success: false, message: "Invalid cookie" });
    }

    // Simulated logic to fetch a new cookie (Replace with real API call if needed)
    const newCookie = "NEW_REFRESHED_ROBLOX_COOKIE";

    return res.json({ success: true, newCookie });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
