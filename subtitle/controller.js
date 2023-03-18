"use strict";

const services = require('./services')

module.exports = (app, handler, ruta) => {

//?name=Better.Call.Saul.S02E01
    app.route(`${ruta}/:id`)
        .get(handler(async (req, res, next) => {
            let result = await services.find(req.params.id, req.query.name);
            res.json(result);
    }));

	app.route(ruta)	
		.put(handler(async (req, res, next) => {
//{"_id": "C:/temp/Better.Call.Saul.S02E01.PROPER.HDTV.x264-KILLERS.mp4", "link": "http://www.subdivx.com/X6XNDU2OTY0X-better-call-saul-s02e01.html" }
            const capitulo = req.body;
            const result = await services.save(capitulo._id, capitulo.link);
            res.json(result);
    })).patch(handler(async (req, res, next) => {
//{"_id": "C:/temp/Better.Call.Saul.S02E01.PROPER.HDTV.x264-KILLERS.srt", "offset": 1500}
            let file = req.body._id;
            let offset = req.body.offset;
			let init = req.body.init;
            await services.synchronize(file, offset, init);
            res.json({});
    }));
}