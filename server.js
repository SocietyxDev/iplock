const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// HTML Form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Age Change Endpoint
app.post('/change-age', async (req, res) => {
    const { cookie, password } = req.body;

    try {
        // Step 1: Get CSRF Token
        const csrfToken = await getCsrfToken(cookie);
        
        // Step 2: Verify Account Settings
        const settings = await getAccountSettings(cookie, csrfToken);
        
        if (!settings.UserAbove13) {
            return res.json({ success: false, message: "Account is already set to Under 13" });
        }

        // Step 3: Attempt Age Change
        const changeResult = await changeAgeSetting(cookie, csrfToken, password, false);
        
        if (changeResult) {
            res.json({ success: true, message: "Age successfully changed to Under 13" });
        } else {
            res.json({ success: false, message: "Failed to change age setting" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.json({ success: false, message: "Authentication failed - Invalid cookie or password" });
    }
});

// Helper Functions
async function getCsrfToken(cookie) {
    const response = await axios.post('https://auth.roblox.com/v2/login', {}, {
        headers: {
            'Cookie': `.ROBLOSECURITY=${cookie}`,
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });
    
    return response.headers['x-csrf-token'];
}

async function getAccountSettings(cookie, csrfToken) {
    const response = await axios.get('https://www.roblox.com/my/settings/json', {
        headers: {
            'Cookie': `.ROBLOSECURITY=${cookie}`,
            'X-CSRF-TOKEN': csrfToken
        }
    });
    return response.data;
}

async function changeAgeSetting(cookie, csrfToken, password, newAgeStatus) {
    try {
        const response = await axios.post('https://www.roblox.com/my/account', 
            `Password=${encodeURIComponent(password)}&UserAbove13=${newAgeStatus ? 'true' : 'false'}`, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`,
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });
        
        // Check for successful redirect (Roblox does 302 on success)
        return response.status === 302;
    } catch (error) {
        console.error("Change age error:", error.response?.data || error.message);
        return false;
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
