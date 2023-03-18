'use strict'

const explorer = require('./explorer/controller.js');
const subtitle = require('./subtitle/controller.js');

module.exports = (app, handler) => {
    explorer(app, handler, '/explorer');
    subtitle(app, handler, '/subtitle');
}