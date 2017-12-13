/**
 * Patients.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    dontUseObjectIds: true,

    attributes: {
        organization: {

            model: 'organization'

        },
        doctor: {
            model: 'doctors'
        },
        patientid: {
            columnName: '_id',
            type: 'string'
        },
        accesstoken: {
            type: 'string'
        },
        case_history: {
            type: 'string'
        },
        level: {
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
        gender: {
            type: 'string'

        },
        age_range: {
            type: 'string'

        },
        feeds: {

            collection: 'feed',
            via: 'userid'

        }






    },
    connection: 'mongodb'
};
