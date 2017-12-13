/**
 * OrganizationController
 *
 * @description :: Server-side logic for managing organizations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var jwt = require('jsonwebtoken');

module.exports = {

    //    createOrganization: function (req, res) {
    //
    //        Organization.create({
    //            organizationid: req.param('organizationid'),
    //            name: req.param('name'),
    //            email: req.param('email'),
    //            refreshtoken: jwt.sign({
    //                name: req.param('name'),
    //                email: req.param('email')
    //            })
    //
    //
    //        }).exec(function (err, newUser) {
    //            // If there was an error, we negotiate it.
    //            if (err)
    //                return res.send(err);
    //            else
    //                res.send(newUser);
    //        });
    //    }

    get: function (req, res) {
        Organization.find().exec(function (err, organizations) {

            if (err) return res.json(err);
            else
                return res.json(organizations);
        })
    },
    update_token: function (req, res) {
        var org_id = req.param.orgid;
        var token = req.param.token;
        Organization.update({
            organizationid: orgid
        }, {
            fcm_token: token
        }).exec(function (err, org_rec) {
            if (err) res.send(err)
            else res.send(org_rec);
        });

    }

    //    router.get('/update_token', function (req, res, next) {
    //
    //    var doc_id = req.body.docid;
    //    var token = req.body.token;
    //    var doctors = [];
    //    mongo.connect(url, function (err, db) {
    //
    //        assert.equal(null, err);
    //
    //        var cursor = db.collection('doctors').find();
    //        cursor.forEach(function (doc, err) {
    //            assert.equal(null, err);
    //            doctors.push(doc);
    //            doctors.forEach(function (doctor, err) {
    //
    //                var doctorid = doctor._id;
    //                if (doctorid == doc_id) {
    //                    db.collection('doctors').update({
    //                            _id: doc_id
    //                        }, {
    //                            $set: {
    //                                "token": token
    //                            }
    //                        },
    //                        function (err, data) {
    //
    //                            assert.equal(null, err);
    //                            console.log(data);
    //                            db.close();
    //
    //                        });
    //                }
    //
    //            })
    //
    //        });
    //
    //
    //
    //    })
    //
    //});


};
