requestAnimationFrame('dotenv').config();

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sql = require('mssql');

app.engine('hbs', exphbs.engine({
  defaultLayout: ''
}));

app.set('view engine', 'hbs');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: process.env.DB_TRUST === 'true' ? true : false
;

}