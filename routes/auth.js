var express=require("express");
var router=express.Router();
var passport=require("passport"),
	User=require("../models/user"),
	middleWare=require("../middleware/func");
var moveStatus=0;






//////////AUTH ROUTES
//show regoster form
router.get("/register",function(req,res){
	res.render("register");
})
//handle sign up logic
router.post("/register",function(req,res){
	var newUser=new User({username:req.body.username,isAdmin:false});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			req.flash("error",err.message);
			return res.render("register");
		}
		else{
			passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to the club "+req.user.username);
				res.redirect("/blogs");
			})
			
		}
	})
});
router.get("/login",function(req,res){
	res.render("login");
})
router.post("/login",passport.authenticate("local",{
	
	successRedirect:"/blogs",
	failureRedirect:"/login",
	
	
}),function(req,res){
	
	
});

router.get("/logout",middleWare.isLoggedIn,function(req,res){
	req.logout();
	req.flash("success","You have successfully logged out , GOOD BYE...");
	res.redirect("/blogs");
	
});//logout yapiliyor ama hala sayfaya erisim var bu yuzden


module.exports=router;
