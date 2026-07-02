const cron = require("node-cron");
const { syncNews } = require("../jobs/newsSync.job");


const CRON_CONFIG = {

  CRON_SCHEDULE: "*/20 * * * *",

  CRON_FETCH_LIMIT: 10,
};


function initCron() {
  console.log("⏰ Initializing news synchronization cron job...");
  console.log(`⏰ Schedule: "${CRON_CONFIG.CRON_SCHEDULE}" | Fetch limit per category: ${CRON_CONFIG.CRON_FETCH_LIMIT}`);

  cron.schedule(CRON_CONFIG.CRON_SCHEDULE, async () => {
    console.log("⏰ Scheduled news synchronization triggered");
    await syncNews();
  });
}

module.exports = {
  initCron,
  CRON_CONFIG,
};

