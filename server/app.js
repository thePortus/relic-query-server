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

const app = express();

// favicon location
app.use(favicon('favicon.ico'));

app.use(cors({
  origin: '*'
}));

// parse requests of content-type - application/json
app.use(express.json({ limit: '800mb' }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '800mb'}));

// set root to serve client app
app.use('/', express.static('./pages/'));
// set API routes
require('./routes/index')(app);

// set port, listen for requests
const PORT = process.env.WEB_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
