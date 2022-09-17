const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const fs = require('fs').promises;



const fetchUpworkProjects = async (req, res) => {

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
	await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.33")
	page.setCacheEnabled(false);
  
	page.on('response', response => {
    if (response.url().endsWith("/url?subcategory2_uid=531770282584862733&sort=recency&per_page=10")){
      // Get the response text
      response.text().then(text => {
        // Parse the JSON
        const json = JSON.parse(text);
        
        const projects = json.searchResults.jobs;
        res.status(200).json(projects);
      });
    }
      
      // do something here
  });

  await page.goto('https://www.upwork.com/nx/jobs/search/?subcategory2_uid=531770282584862733&sort=recency');

  await page.screenshot({path: 'upwork-init.png'});

  // Close the browser
  await browser.close();

};

module.exports = {
  fetchUpworkProjects
};