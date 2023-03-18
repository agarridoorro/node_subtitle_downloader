"use strict";

const superagent = require('superagent');
const binaryParser = require('superagent-binary-parser');
require('superagent-charset')(superagent);

module.exports = {
    gettingHTML: gettingHTML,
    gettingBinary: gettingBinary
}

function gettingHTML(url, parameters) {

    return new Promise((resolve, reject) => {
        superagent.get(url).query(parameters).charset('iso-8859-1').end((err, res) => {
            if (err) reject(err);
            else resolve(res.text);
        })
    });
}

function gettingBinary(url) {

    return new Promise((resolve, reject) => {
        superagent.get(url).parse(binaryParser).buffer().end((err, res) => {
            if (err) reject(err);
            else resolve(res.body);
        })
    });    
}