var express=require("express");
var router=express.Router();
var Blog=require("../models/blog"),
	Comments=require("../models/comment"),
	expressSanitizer = require("express-sanitizer"),
	middleWare=require("../middleware/func");




//RESTFUL ROUTES

//INDEX ROUTE
router.get("/",function(req,res){
	Blog.find({},function(err,allBlogs){
		if(err){
			console.log("EROOOOOORRR");
		}
		else{
			res.render("index",{blogs:allBlogs});
		}
	})
	
	
})

//NEW ROUTE
router.get("/new",middleWare.checkAdmin,function(req,res){
	res.render("new");
})

//CREATE ROUTE
router.post("/",middleWare.checkAdmin,function(req,res){
	var author={
		username:req.user.username,
		id:req.user._id
	}
	req.body.blog.body=req.sanitize(req.body.blog.body);
	
	Blog.create({title:req.body.blog.title,category:req.body.blog.category,image:req.body.blog.image,body:req.body.blog.body,author:author},function(err){
		if(err){
			console.log(err)
		}
		else{
			res.redirect("/blogs");
		}
	})
})
//SHOW ROUTE
router.get("/:id",function(req,res){
	Blog.findById(req.params.id).populate("comments").exec(function(err,blogs){
		if(err){
			res.render("errorpage");
		}
		else{
			res.render("show",{blogs:blogs});
		}
	})
	
})
//EDIT ROUTE
router.get("/:id/edit",middleWare.checkAdmin,function(req,res){
	Blog.findById(req.params.id,function(err,found){
		if(err){
			res.render("errorpage");
		}
		else{
			res.render("edit",{blog:found});
		}
	})
})
//UPDATE ROUTE
router.put("/:id",middleWare.checkAdmin,function(req,res){
	
	req.body.blog.body=req.sanitize(req.body.blog.body);
	
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,update){
		if(err){
			res.render("errorpage");
		}
		else{
		res.redirect("/blogs/"+update._id);
	}
	})
})
//DELETE ROUTE
router.delete("/:id",middleWare.checkAdmin,function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.render("errorpage");
		}
		else{
			res.redirect('back');
		}
	})
})	


module.exports=router;
