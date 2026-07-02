const cron = require("node-cron");
const { syncNews } = require("../jobs/newsSync.job");

/**
 * Initializes the cron job to run every 4 hours automatically.
 */
function initCron() {
  console.log("⏰ Initializing news synchronization cron job...");
  
  // "0 */4 * * *": Run every 4 hours
  cron.schedule("0 */4 * * *", async () => {
    console.log("⏰ Scheduled news synchronization triggered");
    await syncNews();
  });
}

module.exports = {
  initCron,
};
