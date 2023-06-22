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
app.get('/', (req, res) => {
  sql.connect(config, () => {
    var hearings = new sql.Request();
    const selectQueryAll = `select id, link, convert(varchar, hearing_date, 23) as hearing_date, convert(varchar(5), time_from, 108) as time_from, convert(varchar(5), time_to, 108) as time_to, info, signature, location from simple_v_hearing`;
    hearings.query(selectQueryAll, function(hearingErr, hearingResult) {
      if (hearingErr) {
        console.log(hearingErr);
        return res.status(500).send('Error retrieving simple hearings');
      }

      // Render the hearing page with the list of buildings and locations
      res.render('hearing', {
        pageTitle: 'Rozprawy',
        hearings: hearingResult.recordset
        });
    });
  });
});

app.get('/edit-hearing', (req, res) => {
  sql.connect(config, () => {
    var hearings = new sql.Request();
    const selectQueryAll = `select id, link, convert(varchar, hearing_date, 23) as hearing_date, convert(varchar(5), time_from, 108) as time_from, convert(varchar(5), time_to, 108) as time_to, info, signature, location from simple_v_hearing`;
    hearings.query(selectQueryAll, function(hearingErr, hearingResult) {
      if (hearingErr) {
        console.log(hearingErr);
        return res.status(500).send('Error retrieving simple hearings');
      }

      // Render the hearing page with the list of buildings and locations
      res.render('edit-hearing', {
        pageTitle: 'Rozprawy',
        hearings: hearingResult.recordset
        });
    });
  });
});

// insert the submitted form data into the locations table
app.post('/edit-hearing', (req, res) => {
  console.log('req.body: ', req.body);
  const link = req.body.link;
  const hearing_date = req.body.hearing_date;
  const time_from = req.body.time_from;
  const time_to = req.body.time_to;
  const info = req.body.info;
  const signature = req.body.signature;
  const location = req.body.location;

  sql.connect(config, (err) => {
    if (err) throw err;

    const request = new sql.Request();
    const query = `INSERT INTO simple_v_hearing (link, hearing_date, time_from, time_to, info, signature, location) VALUES ('${link}', '${hearing_date}', '${time_from}', '${time_to}', '${info}', '${signature}', '${location}')`;

    console.log('query: ', query);

    request.query(query, (err, result) => {
      if (err) throw err;

      console.log('Hearing added successfully!');
      res.redirect('/edit-hearing');
    });
  });
});

app.get('/edit-hearing/:id', (req, res) => {
  const id = req.params.id;
  
  // Use the id to query the database and retrieve the row
  // Perform your database query here
  sql.connect(config, (err) => {
    if (err) throw err;

    const request = new sql.Request();
    const selectQueryById = `select id, link, convert(varchar, hearing_date, 23) as hearing_date, convert(varchar(5), time_from, 108) as time_from, convert(varchar(5), time_to, 108) as time_to, info, signature, location from simple_v_hearing where id = ${id}`;
    

    console.log('query: ', selectQueryById);

    request.query(selectQueryById, (err, result) => {
      if (err) throw err;

      console.log('Hearing data retrieved successfully!: ', result);
      res.json(result.recordset);
    });
  });
});



///////////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
})