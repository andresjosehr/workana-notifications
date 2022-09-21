const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const fs = require('fs').promises;
const {query} = require('../../database/index');




const fetchUpworkProjects = async (req, res) => {

  const projects = await query('SELECT * FROM upwork_projects');

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
	await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.33")
	page.setCacheEnabled(false);
  
	page.on('response', async response => {
    if (response.url().endsWith("/url?sort=recency&category2_uid=531770282580668418&subcategory2_uid=531770282584862733&per_page=10")){
        
      // Get the response text
          const text = await response.text();
          // Parse the JSON
          const fetchedProjects = JSON.parse(text).searchResults.jobs.map(job => {
            
            const date = new Date(job.createdOn);
            // Substract 4 hours from the date
            // date.setHours(date.getHours() - 4);
            return {
              title: job.title,
              description: job.description,
              date: job.createdOn,
              price: job.hourlyBudgetText ? job.hourlyBudgetText + ' Por hora' : job.amount.amount + ' ' + job.amount.currencyCode+ ' Fijo',
              VzlaDate: date.toLocaleString(),
            }

          });

          res.status(200).json(fetchedProjects);
    }
  });

  await page.goto('https://www.upwork.com/nx/jobs/search/?sort=recency&category2_uid=531770282580668418&subcategory2_uid=531770282584862733');

  await page.screenshot({path: 'upwork-init.png'});

  // Close the browser
  await browser.close();

};

module.exports = {
  fetchUpworkProjects
};