const axios = require("axios");

const encodedParams = new URLSearchParams();
encodedParams.append("text", "The POST method has several advantages over GET: it is more secure because most of the request is hidden from the user; Suitable for big data operations.");
encodedParams.append("tl", "es");
encodedParams.append("sl", "en");

const options = {
  method: 'POST',
  url: 'https://google-translate20.p.rapidapi.com/translate',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': '2ca4dde651msh1c8e8da11d186dcp115393jsn59625c8773a3',
    'X-RapidAPI-Host': 'google-translate20.p.rapidapi.com'
  },
  data: encodedParams
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});