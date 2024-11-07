const date = "2024-11-05"; // Use this variable for both date_start and date_finish

// Convert the date to the desired format: "12 September 2024"
const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return dateObj.toLocaleDateString("en-GB", options);
};

const formattedDate = formatDate(date);

// Use the Vercel serverless function as a proxy
const campaignUrl = `/api/proxy/v1/campaign/monitoring/action-count?date_start=${date}&date_finish=${date}&platforms[]=twitter&platforms[]=instagram&platforms[]=youtube&platforms[]=tiktok&platforms[]=facebook&statuses[]=OK&statuses[]=In%20Progress&statuses[]=In%20Queue&statuses[]=Error&statuses[]=Canceled`;
const boosterUrl = `/api/proxy/v1/post/booster/monitoring/action-count?date_start=${date}&date_finish=${date}&platforms[]=twitter&platforms[]=instagram&platforms[]=youtube&platforms[]=tiktok&platforms[]=facebook&statuses[]=OK&statuses[]=In%20Progress&statuses[]=In%20Queue&statuses[]=Error&statuses[]=Canceled`;
const massReportUrl = `/api/proxy/v1/mass-report/monitoring/action-count?date_start=${date}&date_finish=${date}&platforms[]=twitter&statuses[]=OK&statuses[]=In%20Progress&statuses[]=In%20Queue&statuses[]=Error&statuses[]=Canceled`;

// Function to fetch and process the data
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }
  const data = await response.json();

  return data.reduce((acc, item) => {
    const { platform, status } = item;

    // Initialize platform entry if it doesn't exist
    if (!acc[platform]) {
      acc[platform] = {
        OK: 0,
        inProgress: 0,
        error: 0,
        inQueue: 0,
        canceled: 0,
      };
    }

    // Accumulate the status counts
    acc[platform].OK += status.OK;
    acc[platform].inProgress += status["In Progress"];
    acc[platform].error += status.Error;
    acc[platform].inQueue += status["In Queue"];
    acc[platform].canceled += status.Canceled;

    return acc;
  }, {});
};

const generateReport = (result, title) => {
  let report = `${title}\n`;
  const platforms = ["twitter", "instagram", "youtube", "facebook", "tiktok"];
  platforms.forEach((platform) => {
    const {
      OK = 0,
      inProgress = 0,
      error = 0,
      inQueue = 0,
      canceled = 0,
    } = result[platform] || {};
    const total = OK + inProgress + error + inQueue + canceled; // Include canceled in the total
    const successPercentage = total > 0 ? ((OK / total) * 100).toFixed(1) : 0; // Round to 1 decimal place
    report += `${
      platform.charAt(0).toUpperCase() + platform.slice(1)
    }: ${successPercentage}%\n`;
  });
  return report;
};

// Fetch campaign, booster, and mass report data, then output the full report
document.getElementById("fetchButton").addEventListener("click", () => {
  Promise.all([
    fetchData(campaignUrl),
    fetchData(boosterUrl),
    fetchData(massReportUrl),
  ])
    .then(([campaignData, boosterData, massReportData]) => {
      let fullReport = `Report Job Pejaten ${formattedDate}\n\n`;

      // Add campaign report
      fullReport += generateReport(campaignData, "Campaign");

      // Add booster report
      fullReport += "\n";
      fullReport += generateReport(boosterData, "Booster");

      // Add mass report
      fullReport += "\n";
      fullReport += generateReport(massReportData, "Mass Report");

      // Output the full report
      document.getElementById("reportOutput").textContent = fullReport;
    })
    .catch((error) => {
      document.getElementById("reportOutput").textContent =
        "There was a problem with the fetch operation: " + error.message;
    });
});
