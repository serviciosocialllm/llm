import { ScraperSNIIM } from "./lib/ScraperSNIIM.js";

(async () => {
  const scraper = new ScraperSNIIM({
    startDate: "01/01/2025",
    endDate: "01/01/2026",
    productId: 732, // platano tabasco
    limit: 6000, // 500 records per page, so this will fetch 12 pages then 500*12 = 6000
  });

  const results = await scraper.scrape();
  console.log(results);
})();
