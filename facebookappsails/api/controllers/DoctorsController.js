/**
 * DoctorsController
 *
 * @description :: Server-side logic for managing doctors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var http = require('http');
var sg = require('sendgrid')("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");
module.exports = {


    signUpDoctors: function (req, res) {
        var file = req.files.uploaded_file;

        //        var helper = require('sendgrid').mail;
        //        var fromEmail = new helper.Email('pranikajain773@gmail.com');
        //        var to = new helper.Email('pranikajain773@gmail.com');
        //
        //        var subject = 'Patient Inconsistent Feed';
        //
        //        var content = new helper.Content('text/html', 'Your Patient whose name is  <strong>' + name + ' </strong>   and email id is ' + patientemail + '  has inconsistency in facebook feed which was updated at  ' + created_time + '    with contents   ' + message + '<br>In order to view   patient records, Please click on the link below to complete your activation:<br><br><a href="http://open.my.app?patientid=' + patientfeedid + '">Activate</a>');
        //        
        //        var file=
        //
        //        var mail = new helper.Mail(fromEmail, subject, to, content);
        //
        //
        //        var request = sg.emptyRequest({
        //            method: 'POST',
        //            path: '/v3/mail/send',
        //            body: mail.toJSON()
        //        })
        //
        //        sg.API(request, function (error, response) {
        //            if (error) {
        //                console.log('Error response received');
        //            }
        //            console.log(response.statusCode);
        //            console.log(response.body);
        //            console.log(response.headers);
        //
        //        });



    },

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
