/**
 * Organization.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    dontUseObjectIds: true,

    attributes: {
        organizationid: {
            columnName: '_id',

            type: 'string'
        },

        email: {
            type: 'string',
            required: 'true'
        },

        name: {
            type: 'string',
            required: 'true'
        },

        fcm_token: {

            type: 'string'

        },

        patients: {
            collection: 'patients',
            via: 'organization'
        },

        doctors: {
            collection: 'doctors',
            via: 'organization'
        }
    },
    connection: 'mongodb'
};
