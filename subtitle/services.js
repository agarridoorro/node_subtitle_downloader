"use strict";

const fs = require('fs');
const readline = require('readline');
const cheerio = require('cheerio');
const unrar = require("node-unrar-js");
const subdivxModel = require('./model');
const file = require('../domain/file')
const http = require('../domain/http');
const common = require('../domain/common');

const URL_SUBDIVX = 'https://www.subdivx.com/index.php';
const REG_EXP_SUBTITLE = /\d\d:[0-5]\d:[0-5]\d,\d\d\d --> \d\d:[0-5]\d:[0-5]\d,\d\d\d/;

module.exports = {
    find: find,
    save: save,
    synchronize: synchronize
}

async function find(path, name) {

    path = common.decode(path);

    const html = await http.gettingHTML(URL_SUBDIVX, { q: name, accion: 5 });
    const $ = cheerio.load(html);

    const links = $('.titulo_menu_izq');
    const len = links.length;

    const subtitulos = [];

    if (len > 0) {
        const details = $('div #buscador_detalle_sub');
        for (let i = 0; i < len; i++) {
            subtitulos.push(new subdivxModel.Link(links[i].attribs.href, details[i].children[0].data));
        }
    }

    return { _id: path, resultados: subtitulos }
}

async function save(path, link) {

    path = common.decode(path);

    const html = await http.gettingHTML(link, {});
    const $ = cheerio.load(html);

    const dLink = $('.link1').attr('href');
    if (typeof dLink == 'undefined') {
        throw new Error('No encontrado link de descarga');
    }

    const buffer = await http.gettingBinary(dLink);
    const extractor = unrar.createExtractorFromData(buffer);
    const extracted = extractor.extractAll();

    if (extracted[0].state != 'SUCCESS') {
        throw new Error(`Error extracting subtitle, reason:  ${extracted[0].reason}, msg: ${extracted[0].msg}`);
    }

    const bufferExtracted = new Buffer(extracted[1].files[0].extract[1]);

    const parts = file.splitPath(path);
    const subtitleFile = `${parts.parent}/${parts.name}.es.srt`;

    const fd = await file.openingFile(subtitleFile);
    await file.writingFile(fd, bufferExtracted);
    await file.closingFile(fd);

    return { _id: subtitleFile };
}

async function synchronize(path, offset, init) {

	offset = initializeNumber(offset);
	init = initializeNumber(init);
	
	if (null != offset || null != init) {
		path = common.decode(path);
		//Por si el fichero no existe
		await file.statingFile(path);

		const fileInfo = file.splitPath(path);
		if ('srt' != fileInfo.extension.toLowerCase()) {
			throw new Error(`El fichero ${path} no es un subtítulo`);
		}
		const temporary = `${fileInfo.parent}/${fileInfo.name}.tmp`;

		const lineReader = readline.createInterface({
			input: fs.createReadStream(path, {encoding: 'binary'})
		});

		const output = fs.createWriteStream(temporary, {encoding: 'binary'});

		lineReader.on('line', (line) => {
			if (isTimmingLine(line)) {
				if (offset == null) {
					offset = calculateOffset(line, init);
				}
				line = move(line, offset);
			}
			output.write(line + '\r\n');
		});

		await file.closingLineReader(lineReader);
		await file.endingStream(output);

		await file.deletingFile(path);
		await file.renamingFile(temporary, path);
	}
}

function initializeNumber(number) {
	
	if (typeof number == 'undefined' ||
		number == null || 
		(typeof number == 'string' && number.trim() == '') || 
		isNaN(number)) {
		return null;
	}
	return Number(number);
}

function calculateOffset(line, millisInit) {
	let dt = line.substring(0, 12);
	dt = new Date(`1970-01-01T${dt.replace(',', '.')}Z`);
	return millisInit - dt.getTime();
}

//00:45:42,448 --> 00:45:47,695
function move(line, millis) {
	const first = addMilliseconds(line.substring(0, 12), millis);
	const second = addMilliseconds(line.substring(17, 29), millis);
	return `${first} --> ${second}`;
}

function isTimmingLine(line) {
	return (line.match(REG_EXP_SUBTITLE) != null);
}
  
function addMilliseconds(ts, millis) {
	let dt = new Date(`1970-01-01T${ts.replace(',', '.')}Z`);
	dt = new Date(dt.getTime() + millis);
	return `${pad(dt.getHours() - 1, 2)}:${pad(dt.getMinutes(), 2)}:${pad(dt.getSeconds(), 2)},${pad(dt.getMilliseconds(), 3)}`
}

function pad(number, size) {
	let s = String(number);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}