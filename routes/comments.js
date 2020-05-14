var express=require("express");
var router=express.Router({mergeParams:true});//mergeparams true kismi :id kismini yakalamak icin
var Blog=require("../models/blog"),
	Comments=require("../models/comment"),
	User=require("../models/user"),
	expressSanitizer = require("express-sanitizer"),
	middleWare=require("../middleware/func");






//commmennttt
router.post("/",middleWare.isLoggedIn,function(req,res){
	
	Blog.findById(req.params.id,function(err,found){
		if(err){
			req.flash("error","We Couldn`t find the Blog Post");
			res.redirect("/blogs");
		}
		else{
			Comments.create({text:req.body.text},function(err,comment){
				if(err){
					req.flash("error","We Couldn`t find the Comment.");
					res.redirect("/blogs/"+found._id);
				}
				else{
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					found.comments.push(comment);
					found.save();
					req.flash("success","Comment has created successfully...");
					res.redirect("/blogs/"+found._id);
				}
			})
		}
	})
})
	
	////////////////////////////////////////////////////////////////////////
	//edit comment
router.get("/:comment_id/edit",middleWare.checkCommentOwnership,function(req,res){////////////////
	Comments.findById(req.params.comment_id,function(err,found){
		if(err){
			req.flash("error","You don`t have permission to do that");
			res.redirect("/blogs");
		}
		else{
			
			res.render("comments/edit",{blog_id:req.params.id,comment:found});
		}
	})
})


//update comment
router.put("/:comment_id",middleWare.checkCommentOwnership,function(req,res){
	
	req.body.text=req.sanitize(req.body.text);
	
	Comments.findByIdAndUpdate(req.params.comment_id,{text:req.body.text},function(err,update){
		if(err){
			req.flash("error","We couldn`t find the Comment");
			res.redirect("/blogs/"+req.params.id);
		}
		else{
			req.flash("success","Comment has edited successfully...");
		res.redirect("/blogs/"+req.params.id);
	}
	})
})


//delete comment
router.delete("/:comment_id",middleWare.checkCommentOwnership,function(req,res){
	Comments.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			req.flash("error","We couldn`t remove the Comment");
			res.redirect("back");
		}
		else{
			req.flash("success","Comment has removed successfully...");
			res.redirect("/blogs/"+req.params.id);
		}
	})
})	
module.exports=router;