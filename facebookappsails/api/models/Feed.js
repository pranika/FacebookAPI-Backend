/**
 * Feed.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    dontUseObjectIds: true,

    attributes: {
        userid: {

            model: 'patients'

        },

        feedid: {
            columnName: '_id',
            type: 'string'
        },
        story: {
            type: 'string'
        },
        createdtime: {
            type: 'string'
        },
        message: {
            type: 'string'
        },
        email: {
            type: 'string',
            required: 'true'
        },
        email_flag: {
            type: 'int',

        },
        detect_flag: {
            type: 'int',

        },
        process_flag: {
            type: 'int',

        }







    },
    connection: 'mongodb'
};
