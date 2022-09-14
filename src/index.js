require('dotenv').config();

const express = require('express');
const subdomain = require('express-subdomain');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(require('./routes/index'));
app.use(subdomain('workana-notifications', router));

app.use(express.static(path.join(__dirname, 'public')));


app.listen(3000, () => {
    console.log('Server on port 3000');
});