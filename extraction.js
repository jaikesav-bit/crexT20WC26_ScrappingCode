const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

// ================= MAIN FUNCTION =================
async function scrape() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://crex.com/series/t20-world-cup-2026-1UY/matches", {
        waitUntil: "networkidle2"
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    let links = [];

    // collect match links
    $("a.match-card-wrapper").each((i, elem) => {
        let link = $(elem).attr("href");
        if (link) links.push("https://crex.com" + link);
    });

    console.log("Total Matches:", links.length);

    let allBatting = [];
    let allBowling = [];

    // loop through all matches
    for (let i = 0; i < links.length; i++) {
        console.log(`\n========= MATCH ${i + 1} =========`);

        let { batting, bowling } = await scrapeMatch(links[i], browser);

        allBatting.push(...batting);
        allBowling.push(...bowling);
    }

    // save final data
    saveBattingCSV(allBatting, "batting_summary.csv");
    saveBowlingCSV(allBowling, "bowling_summary.csv");

    await browser.close();
}

// ================= MATCH SCRAPER =================
async function scrapeMatch(url, browser) {
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    // ✅ check match status
    let htmlCheck = await page.content();

    if (
        htmlCheck.includes("Match Abandoned") ||
        htmlCheck.includes("No result") ||
        htmlCheck.includes("Match hasn't started")
    ) {
        console.log("⚠️ Skipping match (No data)");

        await page.close();

        return {
            batting: [],
            bowling: []
        };
    }

    // safe wait
    await page.waitForSelector(".batsman-name", { timeout: 5000 })
        .catch(() => {
            console.log("⚠️ No batting data found");
        });
    // get team names
    let html0 = await page.content();
    let $0 = cheerio.load(html0);

    let teamNames = $0(".team-name").map((i, el) =>
        $0(el).text().trim()
    ).get();

    console.log("Teams:", teamNames);

    const tabs = await page.$$(".team-tab");

    let allBatting = [];
    let allBowling = [];

    // loop through both teams
    for (let i = 0; i < tabs.length; i++) {

        console.log(`\n====== TEAM ${i + 1} (${teamNames[i]}) ======`);

        const newTabs = await page.$$(".team-tab");
        await newTabs[i].click();

        // wait for content change
        await page.waitForFunction(() => {
    return document.querySelectorAll(".batsman-name").length > 0;
});

        let html = await page.content();
        let $ = cheerio.load(html);

        let batting = extractBatting($);
        let bowling = extractBowling($);

        let team = teamNames[i];
        let opponent = teamNames[1 - i];

        // add metadata
        batting.forEach(p => {
            allBatting.push({
                team,
                opponent,
                ...p
            });
        });

        bowling.forEach(b => {
            allBowling.push({
                team,
                opponent,
                ...b
            });
        });
    }

    await page.close();

    return {
        batting: allBatting,
        bowling: allBowling
    };
}

// ================= BATSMEN =================
function extractBatting($) {
    let batting = [];

    $(".batsman-name").each((i, el) => {
        let row = $(el).closest("tr");
        let cols = $(row).find("td");

        batting.push({
            player: $(cols[0]).find(".player-name").text().trim(),
            dismissal: $(cols[0]).find(".decision").text().trim(),
            runs: $(cols[1]).text().trim(),
            balls: $(cols[2]).text().trim(),
            fours: $(cols[3]).text().trim(),
            sixes: $(cols[4]).text().trim(),
            sr: $(cols[5]).text().trim()
        });
    });

    return batting;
}

// ================= BOWLERS =================
function extractBowling($) {
    let bowling = [];

    $(".bowler-table").each((i, table) => {

        let headers = $(table).find("thead th").map((i, el) =>
            $(el).text().trim()
        ).get();

        // filter only real bowling table
        if (headers.includes("O") && headers.includes("W")) {

            $(table).find("tbody tr").each((i, row) => {
                let cols = $(row).find("td");

                bowling.push({
                    bowler: $(cols[0]).find(".player-name").text().trim(),
                    overs: $(cols[1]).text().trim(),
                    maidens: $(cols[2]).text().trim(),
                    runs: $(cols[3]).text().trim(),
                    wickets: $(cols[4]).text().trim(),
                    economy: $(cols[5]).text().trim()
                });
            });

        }
    });

    return bowling;
}

// ================= SAVE CSV =================
function saveBattingCSV(data, filename) {
    let csv = "Team,Opponent,Player,Dismissal,Runs,Balls,4s,6s,SR\n";

    data.forEach(p => {
        csv += `${p.team},${p.opponent},${p.player},${p.dismissal},${p.runs},${p.balls},${p.fours},${p.sixes},${p.sr}\n`;
    });

    fs.writeFileSync(filename, csv);
    console.log("Saved file:", filename);
}

function saveBowlingCSV(data, filename) {
    let csv = "Team,Opponent,Bowler,Overs,Maidens,Runs,Wickets,Economy\n";

    data.forEach(b => {
        csv += `${b.team},${b.opponent},${b.bowler},${b.overs},${b.maidens},${b.runs},${b.wickets},${b.economy}\n`;
    });

    fs.writeFileSync(filename, csv);
    console.log("Saved file:", filename);
}

// ================= RUN =================
scrape();