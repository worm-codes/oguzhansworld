var middleWareObj={};
var Blog=require("../models/blog"),
	Comments=require("../models/comment"),
	User=require("../models/user");



middleWareObj.isLoggedIn=function(req,res,next){//bu fonk yaziyoruz kullanicinin sayfasini kontrol ediyoruz girdimi girmedimi diye callback den hemen once yukarda
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error","You Have to Login ");
		res.redirect("/login");
	}
}
middleWareObj.checkBlogOwnership=function(req,res,next){
	if(req.isAuthenticated){
	Blog.findById(req.params.id,function(err,found){
		if(err){
			res.redirect("back");//en son sayfaya yonlendirir
		}
		else{
			if(found.author.id.equals(req.user._id)){
				next();//kullandigimiz yerde bu kisim okey se diger kisma gec demek ynai yolladigimiz yerin icindeki fonksiyon calistir demek
			}
			else{
				
				res.redirect("back");
			}
			
		}
	}
		)}
	else{
		res.redirect("back");
	}
}
middleWareObj.checkCommentOwnership=function(req,res,next){
	if(req.isAuthenticated){
	Comments.findById(req.params.comment_id,function(err,found){
		if(err){
			res.redirect("back");//en son sayfaya yonlendirir
		}
		else{
			if(found.author.id.equals(req.user._id)){
				next();//kullandigimiz yerde bu kisim okey se diger kisma gec demek ynai yolladigimiz yerin icindeki fonksiyon calistir demek
			}
			else{
				res.redirect("back");
			}
			
		}
	}
		)}
	else{
		res.redirect("back");
	}
}
module.exports=middleWareObj;