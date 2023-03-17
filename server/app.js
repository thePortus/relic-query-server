/**
 * @file Main app script. Sets favicon and cors. Allows JSON content.
 * Sets the '/' route to serve static welcome page, and all other routes
 * to be defined by the `routes/` directory. Starts listening on
 * specifiedi port.
 * @author David J. Thomas
 */

const express = require('express');
const cors = require('cors');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

const app = express();

// favicon location
app.use(favicon('favicon.ico'));

app.use(cors({
  origin: '*'
}));


app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb', parameterLimit: 50000 }));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// set root to serve client app
app.use('/', express.static('./pages/'));
// set API routes
require('./routes/index')(app);

// set port, listen for requests
const PORT = process.env.WEB_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
