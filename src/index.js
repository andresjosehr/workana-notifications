require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const router = express.Router();
const app = express()

const db = require('./database/index');
// const sqlite = require('./database/sqlite');

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(require('./routes/index'));

app.use(express.static(path.join(__dirname, 'public')));


app.listen(3000, () => {
    console.log('Server on port 3000');
});

