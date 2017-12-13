/**
 * Doctors.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        dontUseObjectIds: true,

        doctorid: {
            columnName: '_id',
            type: 'string'
        },

        organization: {
            model: 'organization'
        },

        patients: {

            collection: 'patients',
            via: 'doctor'

        },

        email: {
            type: 'string',
            required: 'true'
        },
        name: {
            type: 'string',
            required: 'true'
        },
        specialization: {
            type: 'string'
        },

        status: {
            type: 'string'
        },
        doctortype: {

            type: 'string'
        }

    },
    connection: 'mongodb'
};
