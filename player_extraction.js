const puppeteer = require("puppeteer");
const fs = require("fs");

// 🔥 PROFILE SCRAPER
async function scrapePlayerProfile(url, browser) {
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle2" });
        await page.waitForSelector(".keyValueSection", { timeout: 5000 });

        const data = await page.evaluate(() => {
            let name = "";
            let bats = "";
            let bowls = "";

            document.querySelectorAll(".keyValueSection").forEach(row => {
                const key = row.querySelector(".key")?.innerText.trim().toLowerCase();
                const value = row.querySelector(".value")?.innerText.trim();

                if (key === "name") name = value;
                if (key === "bats") bats = value;
                if (key === "bowls") bowls = value;
            });

            return { name, bats, bowls };
        });

        await page.close();
        return data;

    } catch (err) {
        console.log("❌ Profile failed:", url);
        await page.close();
        return { name: "", bats: "", bowls: "" };
    }
}


// 🔥 CSV SAVER
function saveToCSV(data, filename) {
    const headers = ["Team", "Name", "Role", "Bats", "Bowls", "Image"];
    let csv = headers.join(",") + "\n";

    data.forEach(p => {
        csv += `"${p.team}","${p.name}","${p.role}","${p.bats}","${p.bowls}","${p.image}"\n`;
    });

    fs.writeFileSync(filename, csv);
    console.log("✅ CSV saved:", filename);
}


// 🔥 MAIN SCRAPER
async function scrapeAllTeams() {

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(
        "https://crex.com/series/t20-world-cup-2026-1UY/team-squad",
        { waitUntil: "networkidle2" }
    );

    await page.waitForSelector(".series-left-card");

    const teamNames = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".series-left-card .name"))
            .map(el => el.innerText.trim());
    });

    let finalData = [];

    // 🔁 LOOP ALL TEAMS
    for (let teamName of teamNames) {

        console.log(`\n========= ${teamName} =========`);

        // click correct team
        await page.evaluate((teamName) => {
            const cards = document.querySelectorAll(".series-left-card");

            for (let card of cards) {
                const name = card.querySelector(".name")?.innerText.trim();
                if (name === teamName) {
                    card.click();
                    break;
                }
            }
        }, teamName);

        // wait until correct team is selected
        await page.waitForFunction(
            (teamName) => {
                return document.querySelector(".series-left-card.selected .name")?.innerText.trim() === teamName;
            },
            {},
            teamName
        );

        await new Promise(r => setTimeout(r, 1000));

        const team = await page.evaluate(() => {
            return document.querySelector(".series-left-card.selected .name")?.innerText.trim();
        });

        console.log("Team:", team);

        // ✅ extract players
        const players = await page.evaluate(() => {
            const cards = document.querySelectorAll(".players-wrapper a");
            let data = [];

            cards.forEach(card => {
                const name = card.querySelector(".name")?.innerText.trim() || "";
                const role = card.querySelector(".player-type")?.innerText.trim() || "";
                const link = card.getAttribute("href");
                const image = card.querySelector("img")?.getAttribute("src") || "";

                data.push({
                    name,
                    role,
                    link: link ? "https://crex.com" + link : "",
                    image
                });
            });

            return data;
        });

        // 🔁 LOOP PLAYERS
        for (let player of players) {

            console.log("Fetching (Home):", player.name);

            const profile = await scrapePlayerProfile(player.link, browser);

            // ✅ LOG PROFILE NAME
            console.log(
                `Profile Name: ${profile.name || "❌ Not Found"}`
            );

            finalData.push({
                team,
                name: profile.name || player.name,  // ✅ use profile name
                role: player.role,
                image: player.image,
                bats: profile.bats,
                bowls: profile.bowls
            });

            // small delay for stability
            await new Promise(r => setTimeout(r, 300));
        }
    }

    console.log("\n✅ TOTAL PLAYERS:", finalData.length);

    saveToCSV(finalData, "t20_players.csv");

    await browser.close();
}


// 🚀 RUN
scrapeAllTeams();