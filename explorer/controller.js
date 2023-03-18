"use strict";

const services = require('./services')

module.exports = (app, handler, ruta) => {

    app.route(ruta)
        .get(handler(async (req, res, next) => {
            let file = app.properties.get('base_dir');
			let exts = app.properties.get('video_extensions').split(';');
            let dirContent = await services.gettingContent(file, exts);
            res.json(dirContent);
    }));
	
    app.route(`${ruta}/:id`)
        .get(handler(async (req, res, next) => {
            let file = req.params.id;
			let exts = app.properties.get('video_extensions').split(';');
            let dirContent = await services.gettingContent(file, exts);
            res.json(dirContent);
    }));
}

