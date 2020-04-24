const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '../.env') });
const routes = require('./routes');
const i18n = require('i18n')

const app = express();

const site = process.env.ALLOW_FROM_URL;
app.use(cors({
    origin: site,
    optionsSuccessStatus: 200
}));

i18n.configure({
    locales: ['pt-BR', 'pt', 'en-US', 'en'],
    directory: `${__dirname}/resources/errors`
})

app.use(i18n.init)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(routes);

app.listen(process.env.PORT || 3005);