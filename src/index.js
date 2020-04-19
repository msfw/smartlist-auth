const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '../.env') });
const routes = require('./routes');

const app = express();

const site = process.env.ALLOW_FROM_URL || 'http://localhost:3000';
app.use(cors({
    origin: site,
    optionsSuccessStatus: 200 
}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(routes);

app.listen(process.env.PORT || 3005);