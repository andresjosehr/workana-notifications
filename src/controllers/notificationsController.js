const fetch = require('node-fetch');
const {query} = require('../database/index');

const webspush = require('../webpush');
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);



const fetchProjects = async (req, res) => {
  
  const months = { Enero: '01', Febrero: '02', Marzo: '03', Abril: '04', Mayo: '05', Junio: '06', Julio: '07', Agosto: '08', Septiembre: '09', Octubre: '10', Noviembre: '11', Diciembre: '12'}
  const projects = await query('SELECT * FROM projects');
  

  console.log('=======================================================')

    fetch("https://www.workana.com/jobs?category=it-programming&language=en%2Ces", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"105\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"105\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "cookie": "appcookie[user_locale]=es_AR; OptanonAlertBoxClosed=2022-09-01T16:50:51.924Z; _gcl_au=1.1.821732528.1662051052; _ga=GA1.2.1811885827.1662051052; _gid=GA1.2.1070727024.1662051052; _hjSessionUser_3063107=eyJpZCI6IjliZjQxNWJkLTMyNzYtNWIzZi1iYmQ1LTNhZDlhZDk2ZTk5MCIsImNyZWF0ZWQiOjE2NjIwNTEwNTMwNDIsImV4aXN0aW5nIjpmYWxzZX0=; appcookie[wldh]=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyIyMTU4ODk2IjoiMDkwY2E5NDUwZDBmZjY0YTA2NjUwZTViNTI3Y2FmYjAifQ.VjJ2RvH3LPiHzQJInp9CKuGHrWA2OMegBlflThpKgn0; appcookie[wd]=C4fn2GsFEvmsKjvzteUE2zTtytTSJzARDqJy8TnP; workana_session=iioo8qn4eu7798ub6esnonus4s; __zlcmid=1BklC8JciDqVxpT; appcookie[activeSession]=1; OptanonConsent=isGpcEnabled=0&datestamp=Tue+Sep+06+2022+18%3A09%3A11+GMT-0400+(hora+de+Venezuela)&version=6.34.0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&geolocation=VE%3BN&AwaitingReconsent=false; amplitude_id_c790a5904bdc552ae4abc200f7067347workana.com=eyJkZXZpY2VJZCI6IjRkM2U1ZGU2LTk1NzEtNDY0YS1hMTBjLTUwMTc0NDFiMzRiMVIiLCJ1c2VySWQiOiJpbnRlcmxpbmV2emxhQGdtYWlsLmNvbSIsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTY2MjUwMTU3MzUzMSwibGFzdEV2ZW50VGltZSI6MTY2MjUwMjE1MzE0NiwiZXZlbnRJZCI6MTU3LCJpZGVudGlmeUlkIjoxMywic2VxdWVuY2VOdW1iZXIiOjE3MH0=",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "upgrade-insecure-requests": "1",
        "x-workana-pwa": "null"
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(function (response) {
      return response.text();
    })
    .then(async function (response) {
      const htmlObject = $('<div>'+response+'</div>');
      const fetchProjects = [];
      htmlObject.find(".project-item").each(function(index, element) {
        const title = $(element).find('span').attr('title')+' - '+$(element).find('.values').text();
        const description = $(element).find('.expander').text()
        const date = $(element).find('span.date').attr('title');
        const date2 =  months[date.split(' ')[1].replace(',', '')] + '-'  + date.split(' ')[0] + '-2022' + date.split(', 2022')[1]+':00';
        const date3 = new Date(date2);
        // mm-dd-yyyy hh:mm:ss
        const date4 = (date3.getMonth()+1) + '-' + date3.getDate() + '-' + date3.getFullYear() + ' ' + date3.getHours() + ':' + date3.getMinutes() + ':' + date3.getSeconds();

        const link = 'https://www.workana.com'+$(element).find('a').attr('href');
        fetchProjects.push({title, description, date: date4, link});
      });

      // Compare projects to find new ones
      const newProjects = fetchProjects.filter(function(project) {
        return !projects.find(function(p) {
          return p.title === project.title && p.description === project.description && p.date === project.date;
        });
      });

      const subscriptions = await query('SELECT * FROM machine_keys');
      newProjects.forEach(async function(project) {

        const date = new Date(project.date);
        const now = new Date();

        console.log('Project Name: '+  project.title);
        console.log('Project Datetime: '+ (new Date(date)).toLocaleString());
        console.log('Current Datetime: '+ (new Date(now)).toLocaleString());

        // If project date is less than 5 minutes from now, notify
        if(date.getTime() - now.getTime() > -300000) {

          const payload = JSON.stringify({ title: project.title, message: project.description, link: project.link });
          
          subscriptions.forEach(async e => {
            const subscription = JSON.parse(e.subscription)
            await sendPushNotification(subscription, payload);
          })

          const text = `${project.title}%0A${project.date}%0A%0A${project.description}%0A%0A${project.link}`
          fectchTelegramNotification(text, 'andresjosehr');
          fectchTelegramNotification(text, 'Esthefalop');

        }
        await query('INSERT INTO projects (title, description, date, link) VALUES (?, ?, ?, ?)', [project.title, project.description, project.date, project.link]);
        projects.push(project);
      })

      console.info(
        'Script ejecutado a las ' + new Date().toLocaleTimeString() + ' del ' + new Date().toLocaleDateString()
      )
      console.log('Numero de proyectos consultados: ' + fetchProjects.length)
      console.log('=======================================================')


      res.status(200).json();
    })
    .catch(function (err) {
      console.error('Ha ocurrido un error inesperado: ');
      console.error(err);
    });
};

function fectchTelegramNotification(text, user){
  fetch(`http://api.callmebot.com/text.php?user=${user}&text=${text}`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Microsoft Edge\";v=\"104\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "x-requested-with": "XMLHttpRequest"
    },
    "referrer": `http://api.callmebot.com/text.php?user=${user}&text=${text}`,
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
    }).catch(function (err) {
      console.error('Ha ocurrido un error inesperado: ');
      console.error(err);
    });
}

async function sendPushNotification(subscription, payload) {
  await webspush.sendNotification(subscription, payload).catch(err => {
    console.log('Ocurrio un error');
    console.log(err);
      setTimeout(() => {
        sendPushNotification(subscription, payload);
      }, 30000);
  });
};

module.exports = {
  fetchProjects
}