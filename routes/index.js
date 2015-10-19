var express = require('express');
var questionsMod = require('assignUser');
var router = express.Router();
var app = require('app');

var monk = require('monk');
var db = monk('localhost:27017/expresstest');
var usersCollection = db.get('usercollection');
var questionsCollection = db.get('questions');

function Question(topic, text, title){
	this.topic = topic;
	this.text = text;
	this.title = title;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.anExpressCookie.user){
    res.render('index', { title: 'Express', loggedIn: true, username: req.anExpressCookie.user});
  } else{
  	res.render('index', { title: 'Express', loggedIn: false });
  }
});

router.get('/login', function(req,res,next){
		res.end(JSON.stringify({title:'login page'}));
	res.render('login',{title: 'login'});
});

router.post('/login',function(req, res){
	usersCollection.find({username:req.body.username},{}, function(e, docs){
		if(docs.length==0 || docs[0].password != req.body.password){
			res.end('This user does not exist or the password is wrong')
			}
		else{
			req.anExpressCookie.user = req.body.username;
			res.end('you have been logged in successfully');	
		}	
	});
});

router.get('/register', function(req,res){
    res.render('register',{title: 'register'});
});
module.exports = router;

router.post('/register',function(req, res){
	usersCollection.find({username:req.body.username},{},function(e,docs){
		//check if username is taken
		if(docs.length!=0){
			res.end('this username has already been chosen. Please use anther one!');
		}
		else{
			req.anExpressCookie.user = req.body.username;
			collection.insert({username: req.body.username, password: req.body.password}, function(a,b){
				if(a) throw a;});
		res.end('you have been registered');
		}
	});
});


router.get('/postquestion', function(req, res){
	if(req.anExpressCookie){
		res.render('postquestion',{username:req.anExpressCookie.user});
	}
	else{
		res.end('youre not logged in');
	}
});

router.post('/postquestion', function(req,res){
	if(!req.anExpressCookie.user)
		//res.end('not logged in')
	req.checkBody('topic','topic is required').notEmpty();
	req.checkBody('text', 'text is required').notEmpty();
	req.checkBody('title', 'title is required').notEmpty();

	var errors = req.validationErrors();
	if(errors)
		res.end('fuck no!\n');
	
	else{
		var newQuestion = new Question(req.body.topic, req.body.text, req.body.title);
		questionsMod.insertQuestionRandom(newQuestion);
	}	
});

router.get('/home', function(req,res){    
	if(req.anExpressCookie){
		var username = req.anExpressCookie.user;
		console.log(req.anExpressCookie);
		questionsMod.getAssignedQuestions(username, function(err, assignedQuestions){
			if(err) console.log(err);
			console.log('stuff'+assignedQuestions[0].text);
			res.render('home', {questions:assignedQuestions});
		});
	}
	else{
		res.end('not logged in');
	}
});

router.get('/logout', function(req, res){
	req.anExpressCookie.reset();
	res.end('you have been logged out');
});

module.exports = router;

