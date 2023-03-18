"use strict";

const fileModel = require('./model');
const file = require('../domain/file');
const common = require('../domain/common');

//S01E10
const REG_EXP_SUBTITLE_NAME = /.*s\d{1,2}e\d{1,2}/i;

module.exports = {
    gettingContent: gettingContent
}

async function gettingContent(folder, videoExtensions) {

    folder = common.decode(folder);

    const directoryParts = file.splitPath(folder);
    const parent = common.encode(directoryParts.parent);    

    const folders = [ new fileModel.File(parent, '..', '', true, false) ];
    const files = [];

    const stats = await file.statingFile(folder);
    const isFile = stats.isFile();
    if (isFile) {
		const isSub = isSubtitle(directoryParts);
		const isVid = isVideo(videoExtensions, directoryParts);
		const searchName = getSearchName(isVid, directoryParts.fullName);
		if (isSub || isVid) {
			files.push(new fileModel.File(folder, directoryParts.fullName, searchName, false, isSub));
		}
    } else {
        const items = await file.listingDirectory(folder);
        const len = items.length;
        for (let i = 0; i < len; i++) {

            let fullFileName = folder + '/' + items[i];
            const stats = await file.statingFile(fullFileName)
            const isFile = stats.isFile();
            const fileParts = file.splitPath(fullFileName);
            const isSub = isSubtitle(fileParts);
			const isVid = isVideo(videoExtensions, fileParts);
			const searchName = getSearchName(isVid, items[i]);

            fullFileName = common.encode(fullFileName);    

            if (isFile) {
				if (isSub || isVid) {
					files.push(new fileModel.File(fullFileName, items[i], searchName, false, isSub));
				}
            } else {
                folders.push(new fileModel.File(fullFileName, items[i], '', true, false));
            }
        }
    }

    return new fileModel.Folder(folder, folders.concat(files));
}

function getSearchName(isVideo, name) {
	if (!isVideo) return '';
	let res = name.match(REG_EXP_SUBTITLE_NAME);
	return (res) ? res[0] : name;
}

function isSubtitle(file) {
	return (file.extension.toLowerCase() === 'srt');
}
 
function isVideo(videoExtensions, file) {
	return (videoExtensions.indexOf(file.extension.toLowerCase()) > -1);
}