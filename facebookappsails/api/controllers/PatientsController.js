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


    },

    getAffectedPatients: function (req, res, callback) {

        var affected_patients = [];
        var doc_patients = [];

        var docid = req.param('doctorid');


        Feed.find({
            "detect_flag": 1
        }).exec(function (err, affected_feeds) {

            for (var j = 0; j < affected_feeds.length; j++) {
                affected_patients.push(affected_feeds[j].userid);


            }
            var res_length = affected_patients.length;
            for (var i = 0; i < affected_patients.length; i++) {

                console.log(affected_patients[i]);
                console.log(docid);

                Patients.find({
                    "id": affected_patients[i],
                    "doctor": docid
                }).exec(function (err, listed_patients) {
                    if (err) res.send(err);
                    else {
                        for (var k = 0; k < listed_patients.length; k++) {
                            doc_patients.push(listed_patients[k]);
                            res_length--;

                        }
                    }
                    console.log(res_length);
                    if (res_length == 0)
                        res.send(doc_patients);

                })

            }


        })

    }





};
