var express = require('express');
var router = express.Router();
var mongo=require('mongodb');
var assert= require('assert');
var url='mongodb://192.168.1.116:27017/facebookapi';
var sg = require('sendgrid')("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");
var connect = require('connect');
var FB = require('fb');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');

moment().format();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var fbApp = FB.extend({
    appId: '2009227939306091',
    appSecret: 'b7bc77c3921e94fdccdb2f8635557c76',
    version: '2.9'
})

router.post('/insert_doctor',function(req,res,next){
    
 
    var _id=req.body._id;
    var email=req.body.email;
    var password=req.body.password;
    var name=req.body.name;
    var fcm_token=req.body.fcm_token
    var item={_id:_id,email:email,password:password,name:name,fcm_token:fcm_token};
    

    
    mongo.connect(url,function(err,db){
        
        assert.equal(null,err);
        db.collection('doctors').insertOne(item,function(err,result){
            
            assert.equal(null,err);
            console.log("item inserted");
            console.log(result);
            db.close();
            
        });
        
    })
    
    
});
router.post('/update_patient',function(req,res,next){
    
    var result=[];
    
    var case_history=req.body.case_history;
    var status=req.body.level;
    var patientid=req.body.patientid;
    mongo.connect(url,function(err,db){
       assert.equal(null,err);
       var cursor=db.collection('Patients').find();
        cursor.forEach(function(doc,err){
            assert.equal(null,err);
            result.push(doc);
        },function(){
            
            result.forEach(function(item,err){
                
                if(item._id == patientid)
                {
                        
                    db.collection('Patients').update({_id:patientid}, {$set: {"case_history": case_history,
                                                                             "level":status}},
                                                     
                    function (err, data) {
                        assert.equal(null,err);
                        console.log(data);
                        db.close();
                    }); 
                }
            });
            
        });
        
    });
    
    
    
});


router.get('/storefeeds',function(req,res,next){
    
    mongo.connect(url,function(err,db){
        
        var patients=[];
        
        assert.equal(null,err);
        var cursor=db.collection('Patients').find();
        cursor.forEach(function(doc,err){
            assert.equal(null,err);
            patients.push(doc);
            
        },function(){
        
            patients.forEach(function(patient,err){
//                res.send(patient);
                
                var userid=patient._id;
                var accesstoken=patient.accesstoken;
                FB.api('me', { fields: ['feed', 'email', 'gender', 'name', 'age_range'], access_token: accesstoken }, function (res) {
//                console.log(JSON.stringify(res));
                   
                        var email = res.email;
                        var gender = res.gender;
                        var name = res.name;
                        var age_range = res.age_range;
                        
//                        console.log(res);
//                        console.log(email);
                        
                        var feedData = res.feed.data;
                        console.log(feedData);
                        var newFeeds = [];
                     
                        for (var index in feedData) {
                            var feed = feedData[index];
                            
                           
                            var userid=feed.id.split("_")[0];
                            var message="";
                            if(feed.message==null)
                                {
                                 message="";
                                }
                            else
                                message=feed.message;
                              var story="";
                            if(feed.story==null)
                                {
                                 story="";
                                }
                            else
                                story=feed.story;
                                
                            var item={
                                _id:feed.id,
                                story:story,
                                createdtime:feed.created_time,
                                message:message,
                                email:email,
                                gender:gender,
                                name:name,
                                age_range:age_range,
                                userid:userid
                            };
                            
                          try{
                             db.collection('feed').insertOne(item,function(err,result){
                                 
                                 if (!err) newFeeds.push(item);
                                // else console.log(err)
                                  
                             });
                            }catch(e)
                             {}
                           
                        }
                        
                        console.log("Feed updated ", accesstoken);
                        console.log(newFeeds);
                    
                        
                    
//                  
            });

                
     });
        });
        
    });
    
    
});
router.get('/showfeedsyear',function(req,res,next){
    
    var feeds=[];
    var date=[];
var current=[];
    
    mongo.connect(url,function(err,db){
        
    assert.equal(null,err);
    var cursor=db.collection('feed').find();
    
    cursor.forEach(function(doc,err){
        assert.equal(null,err);
        feeds.push(doc);
    },function(){
        db.close();   
      
        var feedflag=0;
        var patientid;
        feeds.forEach(function(item,err){
        if(item.message.indexOf('Sad')>-1 )
        {
            feedflag=1;
            patientid=item.userid;
         
        }
        });
        var feedarray=[];
        feeds.forEach(function(feeditem,err,next){
           
        if(feeditem.userid ==  patientid)
        {
                    
            var currentdateresult = new Date();
            var currentday=currentdateresult.getDate();
            var currentmonth=currentdateresult.getMonth();
            var currrentyear = currentdateresult.getYear();
           
            var feeddate = new Date(feeditem.createdtime);
            var feedday=feeddate.getDate();
            var feedmonth=feeddate.getMonth();
            var feedyear=feeddate.getYear();
            var epoch = moment(feeddate).unix();
            var datediff=currentdateresult-feeddate;
            var date1 = new Date('2017-08-04T14:28:20.682Z');
            var date2 = new Date('2016-08-04T14:28:20.682Z');
            var epoch1 = moment(currentdateresult).unix();
            var epoch2 = moment(feeddate).unix();
            var diff = epoch1 - epoch2;
            console.log(diff);
            
            var monthdiff=31536000;
            var feedvalue=parseInt(diff) < parseInt(monthdiff);
       
            if(feedvalue == true)
            {
                feedarray.push(feeditem);
                    
            }
        }
            
            
        });
        var myJsonString = JSON.stringify({"year feed": feedarray});
        //var data=JSON.parse({"month feed":myJsonString});
        res.send(myJsonString);
        });
       
    
     });
    
});

router.get('/showfeedsmonth',function(req,res,next){
    
    var feeds=[];
    var date=[];
var current=[];
    
    mongo.connect(url,function(err,db){
        
    assert.equal(null,err);
    var cursor=db.collection('feed').find();
    
    cursor.forEach(function(doc,err){
        assert.equal(null,err);
        feeds.push(doc);
    },function(){
        db.close();   
      
        var feedflag=0;
        var patientid;
        feeds.forEach(function(item,err){
        if(item.message.indexOf('Sad')>-1 )
        {
            feedflag=1;
            patientid=item.userid;
         
        }
        });
        var feedarray=[];
        feeds.forEach(function(feeditem,err,next){
           
        if(feeditem.userid ==  patientid)
        {
                    
            var currentdateresult = new Date();
            var currentday=currentdateresult.getDate();
            var currentmonth=currentdateresult.getMonth();
            var currrentyear = currentdateresult.getYear();
           
            var feeddate = new Date(feeditem.createdtime);
            var feedday=feeddate.getDate();
            var feedmonth=feeddate.getMonth();
            var feedyear=feeddate.getYear();
            var epoch = moment(feeddate).unix();
            var datediff=currentdateresult-feeddate;
            var date1 = new Date('2017-08-04T14:28:20.682Z');
            var date2 = new Date('2016-08-04T14:28:20.682Z');
            var epoch1 = moment(currentdateresult).unix();
            var epoch2 = moment(feeddate).unix();
            var diff = epoch1 - epoch2;
            console.log(diff);
            
            var monthdiff=2678400;
            var feedvalue=parseInt(diff) < parseInt(monthdiff);
       
            if(feedvalue == true)
            {
                feedarray.push(feeditem);
                    
            }
        }
            
            
        });
        var myJsonString = JSON.stringify({"month feed": feedarray});
        //var data=JSON.parse({"month feed":myJsonString});
        res.send(myJsonString);
        });
       
    
     });
    
});

router.get('/improvementlevel',function(req,res,next){
    
   var id=req.id;
    
});


router.get('/showfeedsweek',function(req,res,next){
    
    var feeds=[];
    var date=[];
var current=[];
    
    mongo.connect(url,function(err,db){
        
    assert.equal(null,err);
    var cursor=db.collection('feed').find();
    
    cursor.forEach(function(doc,err){
        assert.equal(null,err);
        feeds.push(doc);
    },function(){
        db.close();   
      
        var feedflag=0;
        var patientid;
        feeds.forEach(function(item,err){
        if(item.message.indexOf('Sad')>-1 )
        {
            feedflag=1;
            patientid=item.userid;
         
        }
        });
        var feedarray=[];
        feeds.forEach(function(feeditem,err,next){
           
        if(feeditem.userid ==  patientid)
        {
                    
            var currentdateresult = new Date();
            var currentday=currentdateresult.getDate();
            var currentmonth=currentdateresult.getMonth();
            var currrentyear = currentdateresult.getYear();
           
            var feeddate = new Date(feeditem.createdtime);
            var feedday=feeddate.getDate();
            var feedmonth=feeddate.getMonth();
            var feedyear=feeddate.getYear();
            var epoch = moment(feeddate).unix();
            var datediff=currentdateresult-feeddate;
            var date1 = new Date('2017-08-04T14:28:20.682Z');
            var date2 = new Date('2016-08-04T14:28:20.682Z');
            var epoch1 = moment(currentdateresult).unix();
            var epoch2 = moment(feeddate).unix();
            var diff = epoch1 - epoch2;
            console.log(diff);
            
            var monthdiff=604800;
            var feedvalue=parseInt(diff) < parseInt(monthdiff);
       
            if(feedvalue == true)
            {
                feedarray.push(feeditem);
                    
            }
        }
            
            
        });
        var myJsonString = JSON.stringify({"week feed": feedarray});
        //var data=JSON.parse({"month feed":myJsonString});
        res.send(myJsonString);
        });
       
    
     });
    
});

router.get('/getafeed',function(req,res,next){
    
    var feeds=[];
    
    mongo.connect(url,function(err,db){
        
    assert.equal(null,err);
    var cursor=db.collection('feed').find();
    
    cursor.forEach(function(doc,err){
        assert.equal(null,err);
        feeds.push(doc);
    },function(){
        db.close();   
      
        var feedflag=0;
        feeds.forEach(function(item,err){
        if(item.message.indexOf('Sad')>-1  && feedflag==0)
        {
            console.log(item);
         

            res.send(item);
            feedflag = 1;
     }
            
        
        });
    });
        
    });
    
});




router.get('/getafeedupdated',function(req,res,next){
    
    var feeds=[];
    var patients=[];
     var doctorid;
    
    mongo.connect(url,function(err,db){
        
    assert.equal(null,err);
    var cursor=db.collection('feed').find();
    var patientcursor=db.collection('Patients').find();
    
    cursor.forEach(function(doc,err){
        assert.equal(null,err);
        feeds.push(doc);
    },function(){
         
      
        var feedflag=0;
       
       
        feeds.forEach(function(item,err){
        if(item.message.indexOf('Sad')>-1 && feedflag==0)
        {
            console.log(item);
            var userid=item.userid;
            feedflag = 1;
        
            
             
          patientcursor.forEach(function(patient,err){
                assert.equal(null,err);
               patients.push(patient);
         
   
            
            }
            ,function(){
              db.close();
              
               // console.log(patients);
                patients.forEach(function(item1,err){
                 
                    
                   // console.log(item1);
                    console.log(userid);
                    
                    if(item1._id==userid)
                        {
                            doctorid=item1.doctorid;
                             var myJsonString = JSON.stringify({"feed": item,"doctorid":doctorid});
            //var data=JSON.parse({"month feed":myJsonString});
                        res.send(myJsonString);
                          
                        }
                    
                });
                
                
          });
            
         
 
            //  console.log("docid"+doctorid);
           
        }
            
     
            
        
        });
    });
        
    });
    
});


router.get('/getfeeds',function(req,res,next){
    
    var feeds=[];
    
    mongo.connect(url,function(err,db){
        
    assert.equal(null,err);
    var cursor=db.collection('feed').find();
    
    cursor.forEach(function(doc,err){
        assert.equal(null,err);
        feeds.push(doc);
    },function(){
           
      
        var feedflag=0;
        feeds.forEach(function(item,err){
        if(item.message.indexOf('Sad')>-1 && item.email_flag == 0)
        {
            console.log(item);
            var feedid=item._id;
            var patientid=item.userid;
        
         
            
            var patientemail=item.email;
            var helper = require('sendgrid').mail;
            var fromEmail = new helper.Email('pranikajain773@gmail.com');
            var toEmail = new helper.Email('pjain03@syr.edu');
            var subject = 'Patient Inconsistent Feed';
            var content = new helper.Content('text/plain', 'Your Patient whose name is  '+item.name+'    and email id is '+patientemail+'  has inconsistency in facebook feed which was updated at  '+item.createdtime+'    with contents   '+item.message );
            var mail = new helper.Mail(fromEmail, subject, toEmail, content);
 
             var request = sg.emptyRequest({
               method: 'POST',
               path: '/v3/mail/send',
               body: mail.toJSON()
            });
            
            sg.API(request, function (error, response) {
            if (error) {
            console.log('Error response received');
            }
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
            res.send(item);
            db.collection('feed').update({_id:feedid}, {$set: {"email_flag": 1}}, function (err, data) {
                assert.equal(null,err);
                console.log(data);
                });  
                
                
        });
          
     }
            
        
        });
    });
    
    });
    
});

module.exports = router;
