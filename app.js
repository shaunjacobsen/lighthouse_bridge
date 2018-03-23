const express = require('express');
const bodyParser = require('body-parser');
require('./config/config');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-instance");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
require('./modules/admin/routes.js')(app);
require('./modules/messages/routes.js')(app);
require('./modules/sensors/routes.js')(app);

// redis


app.listen(process.env.PORT, () => {
  console.log(`Server up on ${process.env.PORT}`);
});

module.exports = { app };
