const fetch = require('node-fetch');
const {query} = require('../database/index');
const moment = require('moment');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
const { Configuration, OpenAIApi } = require("openai");

var $ = jQuery = require('jquery')(window);

const cheerio = require('cheerio');

// Import axios
const axios = require('axios');


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
      htmlObject.find("job-card").each(function(index, element) {
        // Get value of :card attribute
        const card = $(element).attr(':card');

        // Conver to json
        const cardJson = JSON.parse(card);
        // console.log(cardJson)
        
        const title = cheerio.load(cardJson.title, { decodeEntities: true, trim: true }).text()        
        let description = cheerio.load(cardJson.description, { decodeEntities: true, trim: true }).text()

        const aditionalInfo = [
          'Categoría',
          'Subcategoría',
          '¿Es un proyecto o una posición?',
          'Actualmente tengo',
          'Disponibilidad requerida',
          'Roles necesarios'
        ];

        aditionalInfo.forEach(function(info, i) {
          // If first
          if(i === 0) {
            // replace with breakline
            description = description.replace(info, '\n\n' + info);
            return;
          }
          
          // replace with breakline
          
        });



        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const timeAgo = cardJson.postedDate;
        const link = 'https://www.workana.com/job/' + cardJson.slug;
        const price = cardJson.budget;
        
        fetchProjects.push({title, description, date: currentDate, timeAgo: timeAgo, link, price});
      });


      // Compare projects to find new ones
      const newProjects = fetchProjects.filter(function(project) {
        return !projects.find(function(p) {
          return p.title === project.title && p.description === project.description;
        });
      });

      newProjects.forEach(async function(project) {

        const date = new Date(project.date);
        const now = new Date();

          const payload = JSON.stringify({ title: project.title, message: project.description, link: project.link });
          

          try{
            await query('INSERT INTO projects (title, description, date, link) VALUES (?, ?, ?, ?)', [project.title, project.description, project.date, project.link]);
          
            // Get project id
            const project_id = await query('SELECT id FROM projects WHERE title = ? AND description = ? AND date = ? AND link = ?', [project.title, project.description, project.date, project.link]);

            // subscriptions.forEach(async e => {
            // const subscription = JSON.parse(e.subscription)
            // await sendPushNotification(subscription, payload);
          // })

          // Encode title and description to be used in the telegram notification

            // Replace break lines with %0A
            project.description = project.description.replace(/\n/g, '%0A');

            let text = `${project.price} - ${project.title}%0A%0A${project.description}%0A%0A${project.link}%0A%0APropuesta: https://workana-notifications.andresjosehr.com/build-bid/${project_id[0].id}`;

            // replace break lines with %0A
            // 
            fectchTelegramNotification(text, 'andresjosehr');
            // fectchTelegramNotification(text, 'Esthefalop');
            // fectchTelegramNotification(text, 'santiago19t');
            // fectchTelegramNotification(text, 'omarjosehr');
            projects.push(project);
          } catch(err) {
            console.error(err);
          }

      })

      // console.info(
      //   'Script ejecutado a las ' + new Date().toLocaleTimeString() + ' del ' + new Date().toLocaleDateString()
      // )
      // console.log('Numero de proyectos consultados: ' + fetchProjects.length)
      // console.log('=======================================================')


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


const buildProposal = async (req, res) => { 
  // Get id path param
  const { id } = req.params;
  
  if(!id) {
    res.status(400).json({ error: 'Id is required' });
  }

  const project = await query('SELECT * FROM projects WHERE id = ?', [id]);

  if(!project.length) {
    return res.status(404).json({ error: 'Project not found' });
  }


  const body = {
    "model": "llama3-70b-8192",
    "stream": false,
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful AI assistant. Today is Wed May 01 2024, local time is 17:57:54 GMT-0400 (hora de Venezuela).\nIf you need to display math symbols and expressions, put them in double dollar signs \"$$\" (example: $$ x - 1 $$)"
        },
        {
            "role": "user",
            "content": "Necesito que redactes una propuesta en español para un requerimiento que debe tener la siguiente estructura:\n\n1) Introducción (Desarrollador web con 8 años de experiencia en Angular, Laravel y Wordpress).\n2) De que manera la experiencia y los proyectos realizados ayudan a tener una compresión del requerimiento y aportan valor.\n3) De que manera se abordará el requerimiento y que tecnologias se utilizarán (Angular, Laravel, PHP, Typescript, Javascript, Wordpress)\n4) Por que deberian elegirte a ti para el proyecto.\n5) Pregunta corta al cliente sobre algun aspecto del proyecto que tenga que ver con enteder mas a fondo algun aspecto del requerimiento\n\nPuntos a tener en cuenta\n\n2) Debe estar escrita en un tono humano y profesional, sin entusiasmo\n3) No se debe hablar de \"usted\" sino de \"tu\"\n4) La propuesta siempre debe empezar con \"Hola, soy desarrollador de software con mas de 8 años de experiencia...\n6) Evita usar verbos en futuro como \"Utilizaré\" o \"Desarrollare\", en su lugar utiliza \"Utilizaria\" y \"Desarrollaria\"\n6) Menciona por que eres el indicado para el proyecto mencionando e invitando al cliente a revisar el portafolio de proyectos en el perfil de workana\n6) Evita la palabra \"Creo\" o \"Yo creo\" ya que denotan inseguridad\n            \nEl requerimiento es el siguiente:\n\n ". project[0].description
        }
    ]
}

  // MAKE AXIOS REQUEST
  const completion = await axios.post('https://api.groq.com/openai/v1/chat/completions', body, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROP_API_KEY}`
    }
  });

    
  if(completion.status != 200) {
    return res.status(500).json({ error: completion.data });
  }

  const text =  completion.data.choices[0].message.content;

  // return text (not json and include break lines)
  res.set('Content-Type', 'text/plain');
  return res.status(200).send(text);
}

module.exports = {
  fetchProjects,
  buildProposal
}