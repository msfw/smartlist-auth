const express = require('express');

const authController = require('./app/controllers/authController');

const routes = express.Router();

routes.post('/auth/authenticate', authController.authenticate);
routes.post('/auth/register', authController.register);
routes.post('/auth/forgotPassword', authController.forgotPassword);
routes.post('/auth/resetPassword', authController.resetPassword);

module.exports = routes;