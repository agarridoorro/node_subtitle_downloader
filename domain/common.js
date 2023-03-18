"use strict";

module.exports = {
    encode: encode,
    decode: decode
}

function encode(path) {
    return encodeURIComponent(path);
    /*if (path.includes("/")) {
        return encodeURIComponent(path);
    } else {
        return path;
    }*/
}

function decode(path) {
    if (path.includes("/")) {
        return path;
    } else {
        return decodeURIComponent(path);
    }
}