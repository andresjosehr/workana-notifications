const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const fs = require('fs').promises;
const {query} = require('../../database/index');
const playwright = require('playwright');



const fetchUpworkProjects = async (req, res) => {

  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.upwork.com/nx/search/jobs/?per_page=50&q=web&sort=recency');

  const upwork_projects = await query('SELECT * FROM upwork_projects');

  const projects = await page.$$eval('.job-tile', (projects) => {
    // console.log(projects);
    return projects.map((project) => {
      const title = project.querySelector('.up-n-link')?.innerText;
      const description = project.querySelector('.text-body-sm .air3-line-clamp.is-clamped')?.innerText;
      let info = project.querySelector('.job-tile-info-list');
      // insert %0A between each text in tag
      // Iterate for each li
      info = Array.from(info.querySelectorAll('li')).map((li) => {
        return li.innerText;
      }).join('%0A');
      // 
      const skills = Array.from(project.querySelectorAll('.air3-token-container')).map((skill) => skill?.innerText);
      
      const link = "https://www.upwork.com/nx/search/jobs/details/" + project.querySelector('.up-n-link')?.href;
      return {
        title,
        description,
        info,
        skills,
        link
      };
    });

    
  });

  console.log(projects);
  const newProjects = projects.filter(function(project) {
    return !upwork_projects.find(function(p) {
      return p.title === project.title && p.description === project.description;
    });
  });


  for (let project of newProjects) {
    await query('INSERT INTO upwork_projects (title, description, link) VALUES (?, ?, ?)', [project.title, project.description, project.link]);

    // Get last inserted project
    const project_id = await query('SELECT id FROM upwork_projects ORDER BY id DESC LIMIT 1');

    // console.log(project);
    project.description = project.description;

    let text = `UPWORK %0A%0A${project.info} %0A ${project.title} %0A%0A ${project.description} %0A%0A${project.link} %0A%0APropuesta: https://workana-notifications.andresjosehr.com/build-bid/${project_id[0].id}/upwork`;

    console.log(text);
    // Remove all line breaks
    text = text.replace(/\r?\n|\r/g, '');
    fectchTelegramNotification(text, 'andresjosehr');
    // fectchTelegramNotification('Que', 'andresjosehr');
  }

  console.log("EPAAAA");

  await browser.close();

  // res.json(projects);
  

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

  const table = {
    workana: 'projects',
    upwork: 'upwork_projects'
  }
  
  if(!id) {
    res.status(400).json({ error: 'Id is required' });
  }

  const project = await query('SELECT * FROM '+ table[req.params.platform] + ' WHERE id = ?', [id]);


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
            "content": "Necesito que redactes una propuesta en español para un requerimiento que debe tener la siguiente estructura:\n\n1) Introducción (Desarrollador web con 8 años de experiencia en Angular, Laravel y Wordpress).\n2) De que manera la experiencia y los proyectos realizados ayudan a tener una compresión del requerimiento y aportan valor.\n3) De que manera se abordará el requerimiento y que tecnologias se utilizarán (Angular, Laravel, PHP, Typescript, Javascript, Wordpress)\n4) Por que deberian elegirte a ti para el proyecto.\n5) Pregunta corta al cliente sobre algun aspecto del proyecto que tenga que ver con enteder mas a fondo algun aspecto del requerimiento\n\nPuntos a tener en cuenta\n\n2) Debe estar escrita en un tono humano y profesional, sin entusiasmo\n3) No se debe hablar de \"usted\" sino de \"tu\"\n4) La propuesta siempre debe empezar con \"Hola, soy desarrollador de software con mas de 8 años de experiencia...\n6) Evita usar verbos en futuro como \"Utilizaré\" o \"Desarrollare\", en su lugar utiliza \"Utilizaria\" y \"Desarrollaria\"\n6) Menciona por que eres el indicado para el proyecto mencionando e invitando al cliente a revisar el portafolio de proyectos en el perfil de workana\n6) Evita la palabra \"Creo\" o \"Yo creo\" ya que denotan inseguridad\n            \nEl requerimiento es el siguiente:\n\n " + project[0].description
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

  // Close browser

  // return text (not json and include break lines)
  res.set('Content-Type', 'text/plain');


  return res.status(200).send(text);
}

module.exports = {
  fetchUpworkProjects
};