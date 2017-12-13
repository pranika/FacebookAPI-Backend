/**
 * PatientsController
 *
 * @description :: Server-side logic for managing patients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    get: function (req, res) {
        Patients.find().exec(function (err, patients) {

            if (err) return res.json(err);
            else
                return res.json(patients);
        })
    },
    getPatients: function (req, res) {

        var doctorid = req.param('doctorid')


        Patients.find({
            "doctor": doctorid
        }).exec(function (err, patients) {


            res.json(patients);


        })


    },

    updatePatient: function (req, res, callback) {
        var patientlist = [];
        var docid = req.param('doctorid');
        console.log(docid);
        patientlist = JSON.parse(req.param('patientslist'));
        console.log(patientlist);



        for (var i = 0, len = patientlist.length; i < len; i++) {

            Patients.update({
                patientid: patientlist[i]
            }, {
                doctor: docid
            }).exec(function afterwards(err, updated) {

                if (err) {
                    console.log(err);
                } else callback(err, updated);
            });
        }
        if (callback) return console.log("hi");
    },
    update_status: function (req, res) {


    }





};
