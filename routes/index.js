var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const localStrategy = require('passport-local');
const upload = require('./multer');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login',{error:req.flash('error')});
});

router.get('/feed', function(req, res, next) {
  res.render('feed');
});

router.get('/create', function(req, res, next) {
  res.render('create');
});

router.post('/upload',upload.single('file'), function(req, res, next) {
  if(!req.file){
    return res.status(400).send('No File Were Uploaded')
  }
  res.send('File Uploaded Sucessfully');
});

router.get('/profile', isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({
    username:req.session.passport.user
  }) 
  res.render('profile',{user});
});

router.post('/register',function (req,res,next){
  var UserData = userModel({
    username: req.body.username,
    email:req.body.email,
    fullname: req.body.fullname
  });
  userModel.register(UserData,req.body.password)
  .then(function(){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    })
  })  
})
  

router.post('/login',passport.authenticate('local',
{successRedirect:'/feed',
failureRedirect:'/login',
failureFlash:true
}),function(req,res,next){})

router.get('/logout',function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/')
  }
}

module.exports = router;
