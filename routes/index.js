var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
var url = 'mongodb://139.59.69.180:27017/facebookapi';
var sg = require('sendgrid')("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");
var connect = require('connect');
var FB = require('fb');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');


var FCM = require('fcm-node');
var serverKey = 'AAAAj69Oj6g:APA91bHrx4DNvAVKpVz6lIh75I-aKXwiTyYvhnIcpHub9Qpx3rf6v3wJ2PbM9Tv8-meUrOFSxlEebz_0sfWw4380r7JOxnui8Z5iYKJ8-gyjkeQi96YGQeWVZjOIr8FnCJFu4pWOEDka'; //put your server key here 
var fcm = new FCM(serverKey);

moment().format();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

var fbApp = FB.extend({
    appId: '2009227939306091',
    appSecret: 'b7bc77c3921e94fdccdb2f8635557c76',
    version: '2.9'
})

router.post('/insert_doctor', function (req, res, next) {


    var _id = req.body._id;
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var fcm_token = req.body.fcm_token
    var item = {
        _id: _id,
        email: email,
        password: password,
        name: name,
        fcm_token: fcm_token
    };



    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        db.collection('doctors').insertOne(item, function (err, result) {

            assert.equal(null, err);
            console.log("item inserted");
            console.log(result);
            db.close();

        });

    })


});
router.post('/insert_organization', function (req, res, next) {


    var _id = req.body._id;
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var fcm_token = req.body.fcm_token
    var item = {
        _id: _id,
        email: email,
        password: password,
        name: name,
        fcm_token: fcm_token
    };



    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        db.collection('organization').insertOne(item, function (err, result) {

            assert.equal(null, err);
            console.log("item inserted");
            console.log(result);
            db.close();

        });

    })


});

router.get('/update_token', function (req, res, next) {

    var doc_id = req.body.docid;
    var token = req.body.token;
    var doctors = [];
    mongo.connect(url, function (err, db) {

        assert.equal(null, err);

        var cursor = db.collection('doctors').find();
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            doctors.push(doc);
            doctors.forEach(function (doctor, err) {

                var doctorid = doctor._id;
                if (doctorid == doc_id) {
                    db.collection('doctors').update({
                            _id: doc_id
                        }, {
                            $set: {
                                "token": token
                            }
                        },
                        function (err, data) {

                            assert.equal(null, err);
                            console.log(data);
                            db.close();

                        });
                }

            })

        });



    })

});
router.post('/update_status', function (req, res, next) {

    var patient_id = req.body.patient_id;
    var status = req.body.status;
    var patients = [];

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);

        var cursor = db.collection('patients').find();
        cursor.forEach(function (doc, err) {

            assert.equal(null, err);
            patients.push(doc);


        }, function () {
            // db.close();
            patients.forEach(function (patient, err) {

                if (patient._id == patient_id) {
                    db.collection('patients').update({
                            _id: patient_id
                        }, {
                            $set: {
                                "level": status
                            }
                        },
                        function (err, data) {

                            assert.equal(null, err);
                            console.log(data);
                            db.close();
                        });
                }
            });

        });

    });

});
router.post('/update_patient', function (req, res, next) {

    var result = [];

    var case_history = req.body.case_history;
    var status = req.body.level;
    var patientid = req.body.patientid;
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var cursor = db.collection('patients').find();
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            result.push(doc);
        }, function () {

            result.forEach(function (item, err) {

                if (item._id == patientid) {

                    db.collection('patients').update({
                            _id: patientid
                        }, {
                            $set: {
                                "case_history": case_history,
                                "level": status
                            }
                        },

                        function (err, data) {
                            assert.equal(null, err);
                            console.log(data);
                            db.close();
                        });
                }
            });

        });

    });



});


router.get('/storefeeds', function (req, res, next) {

    mongo.connect(url, function (err, db) {

        var patients = [];

        assert.equal(null, err);
        var cursor = db.collection('patients').find();
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            patients.push(doc);

        }, function () {

            patients.forEach(function (patient, err) {
                //                res.send(patient);

                var userid = patient._id;
                var accesstoken = patient.accesstoken;
                FB.api('me', {
                    fields: ['feed', 'email', 'gender', 'name', 'age_range'],
                    access_token: accesstoken
                }, function (res) {
                    console.log(JSON.stringify(res));

                    var email = res.email;
                    var gender = res.gender;
                    var name = res.name;
                    var age_range = res.age_range;

                    //                        console.log(res);
                    //                        console.log(email);

                    var feedData = res.feed.data;
                    //console.log(feedData);
                    var newFeeds = [];

                    for (var index in feedData) {
                        var feed = feedData[index];


                        var userid = feed.id.split("_")[0];
                        var message = "";
                        if (feed.message == null) {
                            message = "";
                        } else
                            message = feed.message;
                        var story = "";
                        if (feed.story == null) {
                            story = "";
                        } else
                            story = feed.story;

                        var item = {
                            _id: feed.id,
                            story: story,
                            createdtime: new Date(feed.created_time),
                            message: message,
                            email: email,
                            gender: gender,
                            email_flag: 0,
                            detect_flag: 0,
                            process_flag: 0,
                            name: name,
                            age_range: age_range,
                            userid: userid
                        };

                        try {
                            db.collection('feed').insertOne(item, function (err, result) {

                                if (!err) newFeeds.push(item);
                                // else console.log(err)

                            });
                        } catch (e) {}

                    }

                });


            });
        });

    });


});
router.get('/showfeedsyear', function (req, res, next) {

    var feeds = [];
    var date = [];
    var current = [];

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('feed').find();

        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            feeds.push(doc);
        }, function () {
            db.close();

            var feedflag = 0;
            var patientid;
            feeds.forEach(function (item, err) {
                if (item.detect_flag == 1) {
                    feedflag = 1;
                    patientid = item.userid;

                }
            });
            var feedarray = [];
            feeds.forEach(function (feeditem, err, next) {

                if (feeditem.userid == patientid) {

                    var currentdateresult = new Date();
                    var currentday = currentdateresult.getDate();
                    var currentmonth = currentdateresult.getMonth();
                    var currrentyear = currentdateresult.getYear();

                    var feeddate = new Date(feeditem.createdtime);
                    var feedday = feeddate.getDate();
                    var feedmonth = feeddate.getMonth();
                    var feedyear = feeddate.getYear();
                    var epoch = moment(feeddate).unix();
                    var datediff = currentdateresult - feeddate;
                    var date1 = new Date('2017-08-04T14:28:20.682Z');
                    var date2 = new Date('2016-08-04T14:28:20.682Z');
                    var epoch1 = moment(currentdateresult).unix();
                    var epoch2 = moment(feeddate).unix();
                    var diff = epoch1 - epoch2;
                    console.log(diff);

                    var monthdiff = 31536000;
                    var feedvalue = parseInt(diff) < parseInt(monthdiff);

                    if (feedvalue == true) {
                        feedarray.push(feeditem);

                    }
                }


            });
            var frequency_of_posts = feedarray.length;
            var myJsonString = JSON.stringify({
                "year feed": feedarray,
                "no. of posts": frequency_of_posts

            });
            res.send(myJsonString);
        });


    });

});

router.get('/showfeedsmonth', function (req, res, next) {

    var feeds = [];
    var date = [];
    var current = [];

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('feed').find();

        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            feeds.push(doc);
        }, function () {
            db.close();

            var feedflag = 0;
            var patientid;
            feeds.forEach(function (item, err) {
                if (item.detect_flag == 1) {
                    feedflag = 1;
                    patientid = item.userid;

                }
            });
            var feedarray = [];
            feeds.forEach(function (feeditem, err, next) {

                if (feeditem.userid == patientid) {

                    var currentdateresult = new Date();
                    var currentday = currentdateresult.getDate();
                    var currentmonth = currentdateresult.getMonth();
                    var currrentyear = currentdateresult.getYear();

                    var feeddate = new Date(feeditem.createdtime);
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
                        feedarray.push(feeditem);

                    }
                }


            });
            var frequency_of_posts = feedarray.length;
            var myJsonString = JSON.stringify({
                "month feed": feedarray,
                "no. of posts": frequency_of_posts
            });

            res.send(myJsonString);
        });


    });

});

Date.daysBetween = function (date1, date2) { //Get 1 day in milliseconds   
    var one_day = 1000 * 60 * 60 * 24; // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime(); // Calculate the difference in milliseconds  
    var difference_ms = date2_ms - date1_ms; // Convert back to days and return   
    return Math.round(difference_ms / one_day);
}

router.get('/improvementlevel', function (req, res, next) {

    var id = req.id;

});


router.get('/showfeedsweek', function (req, res, next) {

    var feeds = [];
    var date = [];
    var current = [];
    var feedweekfull = [];
    var json;
    var JsonGraph;

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('feed').find();

        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            feeds.push(doc);
        }, function () {
            // db.close();

            var feedflag = 0;
            var patientid;
            feeds.forEach(function (item, err) {
                if (item.detect_flag == 1) {
                    feedflag = 1;
                    patientid = item.userid;

                }
            });
            var feedarray = [];
            feeds.forEach(function (feeditem, err, next) {

                if (feeditem.userid == patientid) {

                    var currentdateresult = new Date();
                    var currentday = currentdateresult.getDate();
                    var currentmonth = currentdateresult.getMonth();
                    var currrentyear = currentdateresult.getYear();


                    var feeddate = new Date(feeditem.createdtime);

                    var feedday = feeddate.getDate();

                    var feedmonth = feeddate.getMonth();
                    var feedyear = feeddate.getYear();
                    var epoch = moment(feeddate).unix();
                    var datediff = currentdateresult - feeddate;
                    var date1 = new Date('2017-08-04T14:28:20.682Z');
                    var date2 = new Date('2016-08-04T14:28:20.682Z');
                    var epoch1 = moment(currentdateresult).unix();
                    var epoch2 = moment(feeddate).unix();

                    var diff = epoch1 - epoch2;
                    var monthdiff = 604800;
                    var feedvalue = parseInt(diff) < parseInt(monthdiff);
                    var feedweek = [];

                    if (feedvalue == true) {
                        feedarray.push(feeditem);
                    }
                }
            });
            var options = {
                "sort": "createdtime"
            }
            var newCursor = db.collection('feed').aggregate({
                $match: {

                    userid: patientid
                }

            }, {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdtime"
                        },
                        month: {
                            $month: "$createdtime"
                        },
                        day: {
                            $dayOfMonth: "$createdtime"
                        },
                        date: new Date(Date.UTC('$day', '$month', '$year'))


                    },
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }, options);
            var arrayweek = [];
            newCursor.forEach(function (doc, err) {
                assert.equal(null, err);
                console.log(doc);
                arrayweek.push(doc);

                var year = doc._id.year;
                var month = doc._id.month;
                var day = doc._id.day;

                var datefill = doc._id.year + '-' + doc._id.month + '-' + doc._id.day;
                var dateiso = new Date(datefill)
                var map = {
                    date: dateiso.toISOString(),
                    count: doc.count
                };

                feedweekfull.push(map);

            }, function () {
                var newvalue = [];
                var singlevalue = [];
                feedweekfull.forEach(function (singlefeed, err) {
                    // console.log(singlefeed);
                    //
                    //    var date = new Date(singlefeed.get('date'));
                    var datevalue = singlefeed.date

                    var count = singlefeed.count
                    //  console.log(datevalue);
                    //    console.log(count);

                    var weekjson = JSON.stringify({
                        "date": datevalue,
                        "count": count
                    });

                    //**************************************
                    var currentdateresult = new Date();
                    var currentday = currentdateresult.getDate();
                    var currentmonth = currentdateresult.getMonth();
                    var currrentyear = currentdateresult.getYear();
                    var weekdiff = 604800;
                    var epoch2 = moment(currentdateresult).unix();

                    var epoch3 = moment(datevalue).unix();


                    var diff = epoch2 - epoch3;
                    var feeds = parseInt(diff) < parseInt(weekdiff);


                    if (feeds == true) {


                        newvalue.push(singlefeed);

                    }
                    //******************************************************



                });
                console.log(newvalue);
                //   var b = JSON.stringify(newvalue);
                //   var str = b.replace(/\\/g, '');
                //    console.log(str);

                var frequency_of_posts = feedarray.length;
                var myJsonString = JSON.stringify({
                    "week feed": feedarray,
                    "graph": newvalue

                });

                console.log(myJsonString);
                //  var b = JSON.stringify(myJsonString);
                //    var str = b.replace(/\\/g, "");
                // console.log(str);
                res.send(myJsonString);
            })




        });


    });


});



router.get('/getafeed', function (req, res, next) {

    var feeds = [];

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('feed').find();

        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            feeds.push(doc);
        }, function () {
            db.close();

            var feedflag = 0;
            feeds.forEach(function (item, err) {
                if (item.detect_flag == 1 && feedflag == 0) {
                    console.log(item);


                    res.send(item);
                    feedflag = 1;
                }


            });
        });

    });

});




router.get('/getafeedupdated', function (req, res, next) {

    var feeds = [];
    var patients = [];
    var doctorid;

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('feed').find();
        var patientcursor = db.collection('patients').find();

        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            feeds.push(doc);
        }, function () {


            var feedflag = 0;


            feeds.forEach(function (item, err) {
                if (item.detect_flag == 1 && feedflag == 0) {
                    console.log(item);
                    var userid = item.userid;
                    feedflag = 1;



                    patientcursor.forEach(function (patient, err) {
                        assert.equal(null, err);
                        patients.push(patient);



                    }, function () {
                        db.close();

                        patients.forEach(function (item1, err) {

                            console.log(userid);

                            if (item1._id == userid) {
                                doctorid = item1.doctorid;
                                var myJsonString = JSON.stringify({
                                    "feed": item,
                                    "doctorid": doctorid
                                });
                                res.send(myJsonString);

                            }
                        });

                    });

                }

            });
        });

    });

});


router.get('/getfeeds', function (req, res, next) {

    var feeds = [];
    var patients = [];
    var doctors = [];

    mongo.connect(url, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('feed').find();

        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            feeds.push(doc);
        }, function () {


            var feedflag = 0;
            var doctorid;
            feeds.forEach(function (item, err) {
                if (item.detect_flag == 1 &&
                    item.email_flag == 0) {
                    //console.log(item);
                    var feedid = item._id;
                    var patientid = item.userid;
                    console.log(patientid);
                    var patientemail = item.email;
                    var created_time = item.createdtime;
                    var name = item.name;
                    var message = item.message;


                    var helper = require('sendgrid').mail;
                    var fromEmail = new helper.Email('pranikajain773@gmail.com');
                    var toEmail = new helper.Email('pjain03@syr.edu');
                    var subject = 'Patient Inconsistent Feed';
                    var content = new helper.Content('text/plain', 'Your Patient whose name is  ' + item.name + '    and email id is ' + patientemail + '  has inconsistency in facebook feed which was updated at  ' + item.createdtime + '    with contents   ' + item.message);
                    var mail = new helper.Mail(fromEmail, subject, toEmail, content);

                    var request = sg.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: mail.toJSON()
                    });
                    //                    sg.API(request, function (error, response) {
                    //                        if (error) {
                    //                            console.log('Error response received');
                    //                        }
                    //                        console.log(response.statusCode);
                    //                        console.log(response.body);
                    //                        console.log(response.headers);
                    //                        //res.send(item);
                    //
                    //                    });
                    //*********************************NOTIFY*******************


                    var patient_cursor = db.collection('patients').find();
                    patient_cursor.forEach(function (doc, err) {

                        assert.equal(null, err);
                        patients.push(doc);


                    }, function () {

                        patients.forEach(function (patient, err) {

                            if (patient.patientid == patientid) {
                                doctorid = patient.doctorid;
                                console.log(doctorid);
                            }
                        });

                    });

                    var doctor_cursor = db.collection('doctors').find();
                    doctor_cursor.forEach(function (doct, err) {

                        assert.equal(null, err);
                        doctors.push(doct);



                    }, function () {

                        doctors.forEach(function (doctor, err) {

                            if (doctorid == doctor._id) {
                                var fcm_token = doctor.fcm_token;

                                console.log("FCM TOKEN");
                                console.log(fcm_token);

                                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
                                    to: fcm_token,
                                    // collapse_key: 'your_collapse_key',

                                    notification: {
                                        title: 'Title of your push notification',
                                        body: 'Your Patient whose name is  ' + name + '    and email id is ' + patientemail + '  has inconsistency in facebook feed which was updated at  ' + created_time + '    with contents   ' + message
                                    },

                                    data: { //you can send only notification or only data(or include both) 
                                        patient_id: patient._id

                                    }
                                }

                                fcm.send(message, function (err, response) {
                                    if (err) {

                                        console.log("Something has gone wrong!")
                                    } else {
                                        console.log("Successfully sent with response: ", response)
                                        db.collection('feed').update({
                                            _id: feedid
                                        }, {
                                            $set: {
                                                "email_flag": 1
                                            }
                                        }, function (err, data) {
                                            assert.equal(null, err);


                                        });

                                    }
                                });


                            }

                        });

                    }, function () {

                        db.close();


                    });

                }


            });
        });

    });

});

module.exports = router;
