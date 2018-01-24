/**
 * DoctorsController
 *
 * @description :: Server-side logic for managing doctors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var http = require('http');
module.exports = {

    getNPIDoctors: function (req, res) {

        http.get('http://npiregistry.cms.hhs.gov/api?number=1023053725', (response) => {
            const statusCode = response.statusCode;
            const contentType = response.headers['content-type'];



        })

        res.send(response);
    },

    get: function (req, res) {
        Doctors.find().exec(function (err, doctors) {

            if (err) return res.json(err);
            else
                return res.json(doctors);
        })
    },

    getDoctors: function (req, res) {

        var orgid = req.param('organizationid');

        Doctors.find({
            organization: orgid
        }).exec(function (err, doctors) {

            if (err) res.json(doctors);
            res.json(doctors);
        });


    },
    getorganizationid: function (req, res) {

        var docid = req.param('docid');
        Doctors.find({
            doctorid: docid
        }).exec(function (err, doc_recs) {

            if (err) return res.send(err)
            var organizationid = doc_recs[0].organization;
            res.send(organizationid);
        })
    }

};
