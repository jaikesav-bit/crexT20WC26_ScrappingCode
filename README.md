# 🏏 T20 World Cup 2026 Data Scraper

A Node.js-based web scraping project that extracts match, player, batting, and bowling data from the T20 World Cup 2026 series on Crex.

This project uses **Puppeteer** for browser automation and **Cheerio** for HTML parsing, and exports structured datasets into CSV files for analysis.

---

## 🚀 Features

* 📊 Scrapes **match-level data**
* 🏏 Extracts **batting statistics**
* 🎯 Extracts **bowling statistics**
* 👥 Scrapes **team squads and player profiles**
* 📁 Saves clean datasets into CSV files
* ⚠️ Handles edge cases:

  * Abandoned matches
  * No result matches
  * Matches not started

---

## 🛠️ Tech Stack

* **Node.js**
* **Puppeteer** – browser automation
* **Cheerio** – HTML parsing
* **FS (File System)** – CSV handling

---

## 📂 Project Structure

```
├── matchScraper.js
├── playerScraper.js
├── batting_summary.csv
├── bowling_summary.csv
├── t20_players.csv
└── README.md
```

---

## ⚙️ Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/t20-worldcup-scraper.git
cd t20-worldcup-scraper
```

2. Install dependencies

```bash
npm install puppeteer cheerio
```

---

## ▶️ Usage

### Run Match Scraper

```bash
node matchScraper.js
```

Generates:

* `batting_summary.csv`
* `bowling_summary.csv`

---

### Run Player Scraper

```bash
node playerScraper.js
```

Generates:

* `t20_players.csv`

---

## 📊 Output Data

### Batting Data

* Team
* Opponent
* Player
* Dismissal
* Runs
* Balls
* 4s
* 6s
* Strike Rate

### Bowling Data

* Team
* Opponent
* Bowler
* Overs
* Maidens
* Runs
* Wickets
* Economy

### Player Data

* Team
* Name
* Role
* Batting Style
* Bowling Style
* Image URL

---

## 🧠 How It Works

### Match Scraper

* Collects all match links
* Iterates through each match
* Switches between team tabs
* Extracts batting and bowling tables
* Saves aggregated data into CSV files

### Player Scraper

* Iterates through all teams
* Extracts squad list
* Visits each player profile
* Scrapes batting & bowling styles
* Merges data into a final dataset

---

## ⚠️ Challenges Faced

* Dynamic content loading (handled via Puppeteer waits)
* Handling multiple team tabs per match
* Skipping incomplete matches
* Inconsistent player profile structure
* Avoiding crashes with error handling

---

## 💡 Future Improvements

* Database integration (MongoDB / PostgreSQL)
* Power BI / React dashboard
* Automated scheduled scraping
* Player performance analytics
* Best Playing XI recommendation system

---

## 📈 Use Cases

* Cricket analytics
* Data visualization projects
* Machine learning models
* Fantasy team optimization

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Jai Kesavaa**
