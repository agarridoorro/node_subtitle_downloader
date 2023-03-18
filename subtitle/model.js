'use strict'

const linkClass = class Link
{
    constructor(id, details)
    {
        this._id = id;
        this.details = details;
    }
}

module.exports = {
    Link: linkClass
}