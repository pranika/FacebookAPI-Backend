/**
 * FeedController
 *
 * @description :: Server-side logic for managing feeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 
 */




var sg = require('sendgrid')("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");
var connect = require('connect');
var FB = require('fb');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');
var jwt = require('jsonwebtoken');


var FCM = require('fcm-node');
var serverKey = 'AAAAj69Oj6g:APA91bHrx4DNvAVKpVz6lIh75I-aKXwiTyYvhnIcpHub9Qpx3rf6v3wJ2PbM9Tv8-meUrOFSxlEebz_0sfWw4380r7JOxnui8Z5iYKJ8-gyjkeQi96YGQeWVZjOIr8FnCJFu4pWOEDka'; //put your server key here 
var fcm = new FCM(serverKey);
module.exports = {




    getFeeds: function (req, res, callback) {
        Feed.find({
            detect_flag: 1,
            email_flag: 0

        }).exec(function (err, feeds) {

            if (err) res.send(err);
            else {


                var feedflag = 0;

                for (var i = 0, len = feeds.length; i < len; i++) {

                    console.log(feeds);

                    var feedid = feeds[i]._id;
                    var patientfeedid = feeds[i].userid;
                    console.log(patientfeedid);
                    var patientemail = feeds[i].email;
                    var created_time = feeds[i].createdtime;
                    var name = feeds[i].name;
                    var message = feeds[i].message;
                    var orgemail;
                    var docemail;

                    Patients.find({
                        id: patientfeedid
                    }).exec(function (err, patients) {
                        if (err) return console.log(err);
                        else {
                            console.log(patients);
                            var orgid = patients[0].organization;
                            var docid = patients[0].doctor;

                            Organization.find({
                                id: orgid
                            }).exec(function (err, organization_rec) {
                                console.log(organization_rec)

                                if (err) return console.log(err);
                                else {
                                    orgemail = organization_rec[0].email;
                                    var refreshtoken = jwt.sign({
                                        username: organization_rec[0].name,
                                        patientid: patientfeedid

                                    }, 'secret', {
                                        expiresIn: '24h'
                                    });
                                    console.log(orgemail);

                                    var helper = require('sendgrid').mail;
                                    var fromEmail = new helper.Email('pranikajain773@gmail.com');
                                    var to = new helper.Email('pranikajain773@gmail.com');

                                    var subject = 'Patient Inconsistent Feed';

                                    var content = new helper.Content('text/html', 'Your Patient whose name is  <strong>' + name + ' </strong>   and email id is ' + patientemail + '  has inconsistency in facebook feed which was updated at  ' + created_time + '    with contents   ' + message + '<br>In order to view   patient records, Please click on the link below to complete your activation:<br><br><a href="http://open.my.app?patientid=' + patientfeedid + '">Activate</a>');

                                    var mail = new helper.Mail(fromEmail, subject, to, content);


                                    var request = sg.emptyRequest({
                                        method: 'POST',
                                        path: '/v3/mail/send',
                                        body: mail.toJSON()
                                    })

                                    sg.API(request, function (error, response) {
                                        if (error) {
                                            console.log('Error response received');
                                        }
                                        console.log(response.statusCode);
                                        console.log(response.body);
                                        console.log(response.headers);

                                    });

                                    //*******************notification**********************
                                    var token = organization_rec[0].fcm_token;
                                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
                                        to: token,
                                        // collapse_key: 'your_collapse_key',

                                        notification: {
                                            title: 'Title of your push notification',
                                            body: 'Your Patient whose name is  ' + name + '    and email id is ' + patientemail + '  has inconsistency in facebook feed which was updated at  ' + created_time + '    with contents   ' + message
                                        },

                                        data: { //you can send only notification or only data(or include both) 
                                            patient_id: patientfeedid
                                        }
                                    }

                                    fcm.send(message, function (err, response) {
                                        if (err) {

                                            console.log("Something has gone wrong!")
                                        } else {
                                            console.log("Successfully sent with response: ", response)
                                            Feed.update({
                                                feedid: feedid
                                            }, {
                                                "email_flag": 1
                                            }).exec(function (err, feeds) {

                                                if (err) console.log(err)

                                                console.log(feeds);
                                                // callback(patientfeedid);



                                            })
                                        }
                                    });

                                    //******************************************************
                                }

                            })
                            Doctors.find({
                                id: docid
                            }).exec(function (err, docs) {
                                console.log(docs)

                                if (err) return console.log(err);
                                else {
                                    docemail = docs[0].email;
                                    var docname = docs[0].name;
                                    console.log(docemail);
                                    var helper = require('sendgrid').mail;
                                    var fromEmail = new helper.Email('pranikajain773@gmail.com');
                                    var to = new helper.Email('pjain03@syr.edu');
                                    var content = new helper.Content('text/html', 'Your Patient whose name is  <strong>' + name + ' </strong>   and email id is ' + patientemail + '  has inconsistency in facebook feed which was updated at  ' + created_time + '    with contents   ' + message + '<br>In order to view   patient records, Please click on the link below to complete your activation:<br><br><a href="http://open.my.app?selfpatientid=' + patientfeedid + '">Activate</a>');

                                    var subject = 'Patient Inconsistent Feed';
                                    var mail = new helper.Mail(fromEmail, subject, to, content);
                                    var request = sg.emptyRequest({
                                        method: 'POST',
                                        path: '/v3/mail/send',
                                        body: mail.toJSON()
                                    })

                                    sg.API(request, function (error, response) {
                                        if (error) {
                                            console.log('Error response received');
                                        }
                                        console.log(response.statusCode);
                                        console.log(response.body);
                                        console.log(response.headers);

                                        Feed.update({
                                            email_flag: 1
                                        }, {
                                            doctor: docid
                                        }).exec(function afterwards(err, updated) {

                                            if (err) {
                                                console.log(err);
                                            } else callback(err, updated);
                                        });


                                    });


                                }

                            })
                            //if (callback) res.send(callback);

                        }



                    })

                }


            }
        });


    },
    getafeedupdated: function (req, res, callback) {
        var doctor = req.param('doctor');

        var selfpatientid = req.param('selfpatientid');
        var substitutepatient = req.param('substitute_patient');
        if (doctor == undefined && substitutepatient == undefined) {
            res.send("NO AFFECTED PATIENTS FOUND")
        }
        Feed.find({
            detect_flag: 1,
            email_flag: 0

        }).exec(function (err, feeds) {


            var patientfeedid = feeds[0].userid;

            if (err) return console.log(err);
            else {


                if (selfpatientid != undefined && doctor != undefined) {

                    Patients.find({
                        id: selfpatientid,
                        doctor: doctor
                    }).exec(function (err, patients) {
                        if (err) res.send(err);
                        res.send(feeds);

                    });

                } else if (substitutepatient != undefined) {

                    if (substitutepatient == patientfeedid) {
                        res.send(feeds);

                    }

                } else {
                    res.send([]);
                }



            }
        });


    },



    showfeedsmonth: function (req, res) {
        var feedarray = [];
        var date = [];
        var current = [];


        var doctor = req.param('doctor');
        var substitutepatient = req.param('substitute_patient');
        var selfpatientid = req.param('selfpatientid');


        Feed.find({
            detect_flag: 1,
            email_flag: 0,


        }).exec(function (err, feeds) {

            if (err) res.send(err);

            else {

                for (var i = 0, len = feeds.length; i < len; i++) {


                    var patientfeedid = feeds[i].userid;



                    if (substitutepatient == undefined && doctor != undefined) {

                        Patients.find({
                            id: selfpatientid,
                            doctor: doctor
                        }).exec(function (err, patients) {
                            if (err) res.send(err);

                            console.log(doctor);

                            Feed.find({
                                userid: patients[0].id
                            }).exec(function (err, feeditem) {


                                for (var i = 0, len = feeditem.length; i < len; i++) {



                                    var currentdateresult = new Date();
                                    var currentday = currentdateresult.getDate();
                                    var currentmonth = currentdateresult.getMonth();
                                    var currrentyear = currentdateresult.getYear();

                                    var feeddate = new Date(feeditem[i].createdtime);
                                    var feedday = feeddate.getDate();
                                    var feedmonth = feeddate.getMonth();
                                    var feedyear = feeddate.getYear();
                                    var epoch = moment(feeddate).unix();
                                    var datediff = currentdateresult - feeddate;

                                    var date1 = new Date('2017-08-04T14:28:20.682Z');
                                    var date2 = new Date('2017-08-03T14:28:20.682Z');
                                    var epoch1 = moment(currentdateresult).unix();
                                    var epoch2 = moment(feeddate).unix();
                                    var diff = epoch1 - epoch2;

                                    console.log(diff);

                                    var monthdiff = 2678400;
                                    var daydiff = 86400;
                                    var days = [];



                                    var feedvalue = parseInt(diff) < parseInt(monthdiff);

                                    if (feedvalue == true) {
                                        feedarray.push(feeditem[i]);
                                        console.log(feedarray);

                                    }


                                }

                                var frequency_of_posts = feedarray.length;
                                var myJsonString = JSON.stringify({
                                    "month feed": feedarray,
                                    "no. of posts": frequency_of_posts

                                });
                                console.log(myJsonString);
                                res.send(myJsonString);
                            })



                        })




                    } else if (substitutepatient != undefined) {

                        //********************month feed calculation**********************

                        Feed.find({
                            userid: substitutepatient
                        }).exec(function (err, feeditem) {


                            for (var i = 0, len = feeditem.length; i < len; i++) {
                                var currentdateresult = new Date();
                                var currentday = currentdateresult.getDate();
                                var currentmonth = currentdateresult.getMonth();
                                var currrentyear = currentdateresult.getYear();

                                var feeddate = new Date(feeditem[i].createdtime);
                                var feedday = feeddate.getDate();
                                var feedmonth = feeddate.getMonth();
                                var feedyear = feeddate.getYear();
                                var epoch = moment(feeddate).unix();
                                var datediff = currentdateresult - feeddate;
                                console.log();
                                var date1 = new Date('2017-08-04T14:28:20.682Z');
                                var date2 = new Date('2017-08-03T14:28:20.682Z');
                                var epoch1 = moment(currentdateresult).unix();
                                var epoch2 = moment(feeddate).unix();
                                var diff = epoch1 - epoch2;

                                console.log(diff);

                                var monthdiff = 2678400;
                                var daydiff = 86400;
                                var days = [];
                                var feedvalue = parseInt(diff) < parseInt(monthdiff);

                                if (feedvalue == true) {
                                    feedarray.push(feeditem[i]);

                                }
                            }
                            var frequency_of_posts = feedarray.length;
                            var myJsonString = JSON.stringify({
                                "month feed": feedarray,
                                "no. of posts": frequency_of_posts
                            });

                            res.send(myJsonString);


                        })



                        //***************************************************************


                    }




                }

            }
        });



    },


    showfeedsweek: function (req, res) {
        var feedarray = [];
        var date = [];
        var current = [];


        var doctor = req.param('doctor');
        var substitutepatient = req.param('substitute_patient');
        var selfpatientid = req.param('selfpatientid');


        Feed.find({
            detect_flag: 1,
            email_flag: 0,


        }).exec(function (err, feeds) {

            if (err) res.send(err);

            else {

                for (var i = 0, len = feeds.length; i < len; i++) {


                    var patientfeedid = feeds[i].userid;


                    if (substitutepatient == undefined && doctor != undefined) {

                        Patients.find({
                            id: selfpatientid,
                            doctor: doctor
                        }).exec(function (err, patients) {
                            console.log(doctor);

                            Feed.find({
                                userid: patients[0].id
                            }).exec(function (err, feeditem) {


                                for (var i = 0, len = feeditem.length; i < len; i++) {



                                    var currentdateresult = new Date();
                                    var currentday = currentdateresult.getDate();
                                    var currentmonth = currentdateresult.getMonth();
                                    var currrentyear = currentdateresult.getYear();

                                    var feeddate = new Date(feeditem[i].createdtime);
                                    var feedday = feeddate.getDate();
                                    var feedmonth = feeddate.getMonth();
                                    var feedyear = feeddate.getYear();
                                    var epoch = moment(feeddate).unix();
                                    var datediff = currentdateresult - feeddate;

                                    var date1 = new Date('2017-08-04T14:28:20.682Z');
                                    var date2 = new Date('2017-08-03T14:28:20.682Z');
                                    var epoch1 = moment(currentdateresult).unix();
                                    var epoch2 = moment(feeddate).unix();
                                    var diff = epoch1 - epoch2;

                                    console.log(diff);

                                    var weekdiff = 604800;
                                    var daydiff = 86400;
                                    var days = [];



                                    var feedvalue = parseInt(diff) < parseInt(weekdiff);

                                    if (feedvalue == true) {
                                        feedarray.push(feeditem[i]);
                                        console.log(feedarray);

                                    }


                                }

                                var frequency_of_posts = feedarray.length;
                                var myJsonString = JSON.stringify({
                                    "week feed": feedarray,
                                    "no. of posts": frequency_of_posts

                                });

                                res.send(myJsonString);
                            })



                        })




                    } else if (substitutepatient != undefined) {

                        //********************month feed calculation**********************

                        Feed.find({
                            userid: substitutepatient
                        }).exec(function (err, feeditem) {


                            for (var i = 0, len = feeditem.length; i < len; i++) {
                                var currentdateresult = new Date();
                                var currentday = currentdateresult.getDate();
                                var currentmonth = currentdateresult.getMonth();
                                var currrentyear = currentdateresult.getYear();

                                var feeddate = new Date(feeditem[i].createdtime);
                                var feedday = feeddate.getDate();
                                var feedmonth = feeddate.getMonth();
                                var feedyear = feeddate.getYear();
                                var epoch = moment(feeddate).unix();
                                var datediff = currentdateresult - feeddate;
                                console.log();
                                var date1 = new Date('2017-08-04T14:28:20.682Z');
                                var date2 = new Date('2017-08-03T14:28:20.682Z');
                                var epoch1 = moment(currentdateresult).unix();
                                var epoch2 = moment(feeddate).unix();
                                var diff = epoch1 - epoch2;

                                console.log(diff);

                                var weekdiff = 604800;
                                var daydiff = 86400;
                                var days = [];
                                var feedvalue = parseInt(diff) < parseInt(weekdiff);

                                if (feedvalue == true) {
                                    feedarray.push(feeditem[i]);

                                }
                            }
                            var frequency_of_posts = feedarray.length;
                            var myJsonString = JSON.stringify({
                                "week feed": feedarray,
                                "no. of posts": frequency_of_posts
                            });

                            res.send(myJsonString);


                        })



                        //***************************************************************


                    }




                }

            }
        });



    },
    showfeedsyear: function (req, res) {
        var feedarray = [];
        var date = [];
        var current = [];


        var doctor = req.param('doctor');
        var substitutepatient = req.param('substitute_patient');
        var selfpatientid = req.param('selfpatientid');


        Feed.find({
            detect_flag: 1,
            email_flag: 0,


        }).exec(function (err, feeds) {

            if (err) res.send(err);

            else {

                for (var i = 0, len = feeds.length; i < len; i++) {


                    var patientfeedid = feeds[i].userid;


                    if (substitutepatient == undefined && doctor != undefined) {

                        Patients.find({
                            id: selfpatientid,
                            doctor: doctor
                        }).exec(function (err, patients) {
                            console.log(doctor);

                            Feed.find({
                                userid: patients[0].id
                            }).exec(function (err, feeditem) {


                                for (var i = 0, len = feeditem.length; i < len; i++) {



                                    var currentdateresult = new Date();
                                    var currentday = currentdateresult.getDate();
                                    var currentmonth = currentdateresult.getMonth();
                                    var currrentyear = currentdateresult.getYear();

                                    var feeddate = new Date(feeditem[i].createdtime);
                                    var feedday = feeddate.getDate();
                                    var feedmonth = feeddate.getMonth();
                                    var feedyear = feeddate.getYear();
                                    var epoch = moment(feeddate).unix();
                                    var datediff = currentdateresult - feeddate;

                                    var date1 = new Date('2017-08-04T14:28:20.682Z');
                                    var date2 = new Date('2017-08-03T14:28:20.682Z');
                                    var epoch1 = moment(currentdateresult).unix();
                                    var epoch2 = moment(feeddate).unix();
                                    var diff = epoch1 - epoch2;

                                    console.log(diff);

                                    var yeardiff = 31536000;
                                    var daydiff = 86400;
                                    var days = [];



                                    var feedvalue = parseInt(diff) < parseInt(yeardiff);

                                    if (feedvalue == true) {
                                        feedarray.push(feeditem[i]);
                                        console.log(feedarray);

                                    }


                                }

                                var frequency_of_posts = feedarray.length;
                                var myJsonString = JSON.stringify({
                                    "year feed": feedarray,
                                    "no. of posts": frequency_of_posts

                                });

                                res.send(myJsonString);
                            })



                        })




                    } else if (substitutepatient != undefined) {

                        //********************month feed calculation**********************

                        Feed.find({
                            userid: substitutepatient
                        }).exec(function (err, feeditem) {


                            for (var i = 0, len = feeditem.length; i < len; i++) {
                                var currentdateresult = new Date();
                                var currentday = currentdateresult.getDate();
                                var currentmonth = currentdateresult.getMonth();
                                var currrentyear = currentdateresult.getYear();

                                var feeddate = new Date(feeditem[i].createdtime);
                                var feedday = feeddate.getDate();
                                var feedmonth = feeddate.getMonth();
                                var feedyear = feeddate.getYear();
                                var epoch = moment(feeddate).unix();
                                var datediff = currentdateresult - feeddate;
                                console.log();
                                var date1 = new Date('2017-08-04T14:28:20.682Z');
                                var date2 = new Date('2017-08-03T14:28:20.682Z');
                                var epoch1 = moment(currentdateresult).unix();
                                var epoch2 = moment(feeddate).unix();
                                var diff = epoch1 - epoch2;

                                console.log(diff);

                                var yeardiff = 31536000;
                                var daydiff = 86400;
                                var days = [];
                                var feedvalue = parseInt(diff) < parseInt(yeardiff);

                                if (feedvalue == true) {
                                    feedarray.push(feeditem[i]);

                                }
                            }
                            var frequency_of_posts = feedarray.length;
                            var myJsonString = JSON.stringify({
                                "year feed": feedarray,
                                "no. of posts": frequency_of_posts
                            });

                            res.send(myJsonString);


                        })



                        //***************************************************************


                    }




                }

            }
        });



    }






};
