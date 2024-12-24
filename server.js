const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors( { origin : "http://localhost:3000" }));

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
};

// Fetch and parse a webpage
async function fetchPage(url) {
    try {
        const response = await axios.get(url, { headers });
        return cheerio.load(response.data);
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

// Extract profile details
function extractProfileData($) {
    return {
        name: $("h1.top-card-layout__title").text().trim() || "N/A",
        jobTitle: $("h2.top-card-layout__headline").text().trim() || "N/A",
        location: $("span.top-card__subline-item").text().trim() || "N/A",
        about: $("div.about-section").text().trim() || "N/A",
    };
}

// Extract company details
function extractCompanyData($) {
    return {
        companyName: $("h1.org-top-card-summary__title").text().trim() || "N/A",
        industry: $("dd.org-page-details__definition-text").text().trim() || "N/A",
        headquarters: $("div.org-page-details__location").text().trim() || "N/A",
        about: $("p.org-about-us-organization-description").text().trim() || "N/A",
    };
}

// API Endpoint
app.post("/crawl", async (req, res) => {
    const { urls, isProfile } = req.body;

    const results = [];
    for (const url of urls) {
        console.log(`Crawling: ${url}`);
        const $ = await fetchPage(url);
        if ($) {
            const data = isProfile ? extractProfileData($) : extractCompanyData($);
            results.push(data);
        }

        // Anti-bot measure: Add delay
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000 + 2000));
    }

    res.json(results);
});

app.listen(50000, () => {
    console.log("Server running on http://localhost:50000");
});
