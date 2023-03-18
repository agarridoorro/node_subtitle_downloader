'use strict'

const folderClass = class Folder {
    constructor(name, files) {
        this.name = name;
        this.files = files;
    }
}

const fileClass = class File {
    constructor(id, name, searchName, isFolder, isSubtitle) {
        this._id = id;
        this.name = name;
		this.searchName = searchName;
        this.isFolder = isFolder;
        this.isSubtitle = isSubtitle;
    }
}

module.exports = {
    Folder: folderClass,
    File: fileClass
}
