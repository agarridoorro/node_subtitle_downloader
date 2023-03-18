"use strict";

const fs = require('fs');

module.exports = {
    splitPath: splitPath,
    statingFile: statingFile,
    listingDirectory: listingDirectory,
    deletingFile: deletingFile,
    renamingFile: renamingFile,
    openingFile: openingFile,
    writingFile: writingFile,
    closingFile: closingFile,
    closingLineReader : closingLineReader,
    endingStream: endingStream
}

function splitPath(path) {

    let last = path.lastIndexOf('/');

    if (-1 == last) {
        return { parent: path, fullName: '', name: '', extension: '' };
    }

    const parent = path.substring(0, last);
    const fullName = path.substring(last + 1);

    last = fullName.lastIndexOf('.');

    if (-1 == last) {
        return { parent: parent, fullName: fullName, name: fullName, extension: '' };
    }

    const name = fullName.substring(0, last);
    const extension = fullName.substring(last + 1);

    return { parent: parent, fullName: fullName, name: name, extension: extension };
}

function statingFile(path) {
    
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) reject(err);
            else resolve(stats);
        })
    }); 
}

function listingDirectory(directory) {

    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) reject(err);
            else resolve(files);
        })              
    });
}

function deletingFile(path) {

    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}

function renamingFile(name, newName) {

    return new Promise((resolve, reject) => {
        fs.rename(name, newName, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}

function openingFile(path) {

    return new Promise((resolve, reject) => {
        fs.open(path, 'w', (err, fd) => {
            if (err) reject(err);
            else resolve(fd);
        })
    });
}

function writingFile(fd, buffer) {

    return new Promise((resolve, reject) => {
        fs.write(fd, buffer, 0, buffer.length, null, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}

function closingFile(fd) {

    return new Promise((resolve, reject) => {
        fs.close(fd, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}

function closingLineReader(lineReader) {

    return new Promise((resolve, reject) => {
        lineReader.on('close', () => { resolve(); });
    });    
}

function endingStream(stream) {

    return new Promise((resolve, reject) => {
        stream.end(() => { resolve(); })
    });
}