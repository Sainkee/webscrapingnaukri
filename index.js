import puppeteer from "puppeteer";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

(async () => {
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage();
  
    const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
  
    try {
      await page.goto(
        "https://www.naukri.com/it-jobs?src=gnbjobs_homepage_srch",
        {
          waitUntil: "networkidle2",
          timeout: 0,
        }
      );
  
      // Wait for a few seconds to ensure all dynamic content loads
      await sleep(5000); // Wait for 5 seconds
  
      // Ensure that the job cards are present before proceeding
      await page.waitForSelector(".srp-jobtuple-wrapper", {
        timeout: 60000,
      });
  
      console.log("Job cards found");
  
      // Select all job cards
      const jobCards = await page.$$(".srp-jobtuple-wrapper");
  
      const jobs = [];
  
      for (const jobCard of jobCards) {
        const title = await jobCard.$eval(".title", (el) =>
          el.textContent.trim()
        );
        const companyName = await jobCard.$eval(".comp-name", (el) =>
          el.textContent.trim()
        );
        const location = await jobCard.$eval(".locWdth", (el) =>
          el.textContent.trim()
        );
        const jobType = await jobCard.$eval(".expwdth", (el) =>
          el.textContent.trim()
        );
        const postedDate = await jobCard.$eval(".job-post-day", (el) =>
          el.textContent.trim()
        );
        const jobDescription = await jobCard.$eval(".job-desc", (el) =>
          el.textContent.trim()
        );
  
        jobs.push({
          title,
          companyName,
          location,
          jobType,
          postedDate,
          jobDescription,
        });
      }
  
      const fileName = fileURLToPath(import.meta.url);
      const __dirName = dirname(fileName);
      const filePath = `${__dirName}/data.json`;
  
      await fs.writeFile(filePath, JSON.stringify(jobs));
  
    } catch (error) {
      console.error("Error:", error);
    } finally {
      await browser.close();
    }
})();
