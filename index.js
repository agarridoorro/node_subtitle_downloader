'use strict'

const express = require('express');

const middleware = require('./middleware');
const route = require('./route.js');

const app = express();

middleware.configurationHandler(app, express);

route(app, middleware.asyncHandler);

middleware.errorHandler(app)

app.listen(app.properties.get('port'));