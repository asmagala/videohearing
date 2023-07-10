require('dotenv').config();
const path = require('path');

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
app.use(express.static(path.join(__dirname, 'css')));

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: process.env.DB_TRUST === 'true' ? true : false
};

/////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {

  const currDate = new Date().toJSON().slice(0, 10);
  console.log(currDate);

  sql.connect(config, () => {
    var hearings = new sql.Request();


    const selectQueryAll = `SELECT id, link, convert(varchar, hearing_date, 23) as hearing_date, 
      convert(varchar(5), time_from, 108) as time_from, convert(varchar(5), time_to, 108) as time_to, info, signature, location 
      FROM simple_v_hearing 
      WHERE deleted = 0 
      AND hearing_date >= '${currDate}' 
      ORDER BY hearing_date, time_from`;

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

/////////////////////////////////////////////////////////////////////////////
app.get('/get-hearings', (req, res) => {
  sql.connect(config, () => {
    const currDate = new Date().toJSON().slice(0, 10);
    var hearings = new sql.Request();
    const selectQueryAll = `SELECT id, link, 
      convert(varchar, hearing_date, 23) as hearing_date, 
      convert(varchar(5), time_from, 108) as time_from, 
      convert(varchar(5), time_to, 108) as time_to, info, 
      signature, location FROM simple_v_hearing
      WHERE deleted = 0
      AND hearing_date >= '${currDate}' 
      ORDER BY hearing_date, time_from`;
    hearings.query(selectQueryAll, function(hearingErr, hearingResult) {
      if (hearingErr) {
        console.log(hearingErr);
        return res.status(500).send('Error retrieving simple hearings');
      }

      // Render the hearing page with the list of hearings
      res.render('edit-hearing', {
        pageTitle: 'Rozprawy - Edycja',
        hearings: hearingResult.recordset
        });
    });
  });
});

app.post('/add-hearing', (req, res) => {
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
    const query = `INSERT INTO simple_v_hearing 
      (link, hearing_date, time_from, time_to, info, signature, location) 
      VALUES 
      ('${link}', '${hearing_date}', '${time_from}', '${time_to}', '${info}', '${signature}', '${location}')`;

    console.log('query: ', query);

    request.query(query, (err, result) => {
      if (err) throw err;

      console.log('Hearing added successfully!');
      res.redirect('/get-hearings');
    });
  });
});

app.get('/get-hearings/:id', (req, res) => {
  const id = req.params.id;
  
  // Use the id to query the database and retrieve the row
  // Perform your database query here
  sql.connect(config, (err) => {
    if (err) throw err;

    const request = new sql.Request();
    const selectQueryById = `SELECT id, link, convert(varchar, hearing_date, 23) as hearing_date, 
      convert(varchar(5), time_from, 108) as time_from, 
      convert(varchar(5), time_to, 108) as time_to, 
      info, signature, location 
      FROM simple_v_hearing 
      WHERE id = ${id} AND deleted = 0`;
    

    console.log('query: ', selectQueryById);

    request.query(selectQueryById, (err, result) => {
      if (err) throw err;

      console.log('Hearing data retrieved successfully!: ', result);
      res.json(result.recordset);
    });
  });
});

app.post('/change-hearing', (req, res) => {
  console.log('req.body: ', req.body);
  const id = req.body.id;
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
    const query = `UPDATE simple_v_hearing 
      SET link = '${link}', hearing_date = '${hearing_date}', time_from = '${time_from}', 
      time_to = '${time_to}', info = '${info}', signature = '${signature}', 
      location = '${location}' WHERE id = ${id}`;

    console.log('query: ', query);

    request.query(query, (err, result) => {
      if (err) throw err;

      console.log('Hearing added successfully!');
      res.redirect('/get-hearings');
    });
  });
});

app.get('/delete-hearing/:id', (req, res) => {

});

app.post('/delete-hearing', (req, res) => {
  console.log('req.body: ', req.body);
  const id = req.body.id;

  sql.connect(config, (err) => {
    if (err) throw err;

    const request = new sql.Request();
    const query = `UPDATE simple_v_hearing SET deleted = 1 WHERE id = ${id}`;

    console.log('query: ', query);

    request.query(query, (err, result) => {
      if (err) throw err;

      console.log('Hearing DELETED successfully!');
      res.redirect('/get-hearings');
    });
  });
});

///////////////////////////////////////////////////////////////////////////

app.get('/start-comp/', (req, res) => {
  const wol = require('wake_on_lan');

  // Specify the target computer's MAC address
  const macAddress = '04-0E-3C-37-E5-3B';
  
  // Send the WoL packet
  wol.wake(macAddress, (error) => {
    if (error) {
      console.error('Failed to send WoL packet:', error);
      res.json('Problem z wysłaniem pakietu');
    } else {
      console.log('WoL packet sent successfully!');
      res.json('Pakiet wysłany');
    }
  });
});

//////////////////////////////////////////////////////////////////////


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
})