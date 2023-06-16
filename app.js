require('dotenv').config();

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
};

/////////////////////////////////////////////////////////////////////////
app.get('/edit-hearing', (req, res) => {
  sql.connect(config, () => {
    res.render('edit-hearing', {
      pageTitle: 'Dodawanie i edycja rozpraw',
      rozprawa: [
        {
          id: '2',
          name: 'Nazwa rozprawy',
          description: 'Długa nazwa rozprawy'
         }, {
          id: '3',
          name: 'Nazwa rozprawy drugiej',
          description: 'Długa nazwa rozprawy drugiej'
          }
        ]

    });
  });
});




///////////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
})