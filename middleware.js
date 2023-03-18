'use strict'

const bodyParser = require('body-parser');
const propertiesReader = require('properties-reader');

const configurationHandler = (app, express) => {
        
    app.use(express.static(__dirname + '/client', {}))

    //Permite recuperar como objetos JavaScript el contenido emitido por el cliente
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    /*app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE, OPTIONS');
        next();
    });*/

	app.properties = propertiesReader('./cfg.properties');
	
	if (app.properties.get('logRequests')) {
		app.use((req, res, next) => {
			console.log(JSON.stringify({url: req.url, body: req.body}, null, 3));
			next();
		});
	}
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        const routePromise = fn(req, res, next);
        Promise.resolve(routePromise).catch(next);
    }
};

const errorHandler = (app) => {
    app.use((err, req, res, next) => {
        res.status(500);
        console.error(err);
        res.json({error: err.stack});
      });
};

module.exports = {
    configurationHandler: configurationHandler,
    asyncHandler: asyncHandler,
    errorHandler: errorHandler
}