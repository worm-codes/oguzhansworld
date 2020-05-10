var express=require("express"),
	methodOverride=require("method-override"),
    expressSanitizer = require("express-sanitizer"),
	app=express(),
	bodyParser=require("body-parser"),
	mongoose=require("mongoose"),
	flash=require("connect-flash"),
	User=require("./models/user"),
	Blog=require("./models/blog"),
	Comments=require("./models/comment"),
	passport=require("passport"),
	passportLocalMongoose=require("passport-local-mongoose"),
	LocalStrategy=require("passport-local"),
	
	middleWare=require("./middleware/func");

app.use(bodyParser.urlencoded({extended:true}));



//PASSPORT CONFIGURATION
  app.use(require("express-session")({//*
		secret:"Oguzhan Cevik",
		resave:false,
		saveUnitialized:false
		}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());








//APP CONFIG
mongoose.connect("mongodb://localhost/blog_app");
mongoose.set('useFindAndModify', false);
app.set("view engine","ejs");
app.use(express.static("public"));

app.use(expressSanitizer());//bu line html taglarini calistirmaya yariyor kullaniciya javascript kodu girmesini engelliyoruz bir nevi
app.use(methodOverride("_method"));//form lar get ve post dan baska bisey kabul etmiyorlar biz put kullanacagimiz icin method override ediyoruz _method dan sonra ne gorursen onu uygula diyoruz

app.use(flash());
app.use(function(req,res,next){
	res.locals.currentUser=req.user;//cuurentUser kullnacagimiz variable req.use o anki giren kullanici nesnesi bunun yerine status=1 =0 gibi durumlada yapabilirdik
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	
	next();//bunu eklemeliyiz yoksa kod diger parcaya gecmez sadece 1 yerde tanimlar ve durur
});




//RESTFUL ROUTES
app.get("/",function(req,res){
	res.redirect("/blogs");
})
//INDEX ROUTE
app.get("/blogs",function(req,res){
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
app.get("/blogs/new",middleWare.isLoggedIn,function(req,res){
	res.render("new");
})

//CREATE ROUTE
app.post("/blogs",middleWare.isLoggedIn,function(req,res){
	var author={
		username:req.user.username,
		id:req.user._id
	}
	req.body.blog.body=req.sanitize(req.body.blog.body);
	
	Blog.create({title:req.body.blog.title,image:req.body.blog.image,body:req.body.blog.body,author:author},function(err){
		if(err){
			console.log(err)
		}
		else{
			res.redirect("/blogs");
		}
	})
})
//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id).populate("comments").exec(function(err,blogs){
		if(err){
			res.redirect("/blogs")
		}
		else{
			res.render("show",{blogs:blogs});
		}
	})
	
})
//EDIT ROUTE
app.get("/blogs/:id/edit",middleWare.checkBlogOwnership,function(req,res){
	Blog.findById(req.params.id,function(err,found){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit",{blog:found});
		}
	})
})
//UPDATE ROUTE
app.put("/blogs/:id",middleWare.checkBlogOwnership,function(req,res){
	
	req.body.blog.body=req.sanitize(req.body.blog.body);
	
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,update){
		if(err){
			res.redirect("/blogs");
		}
		else{
		res.redirect("/blogs/"+update._id);
	}
	})
})
//DELETE ROUTE
app.delete("/blogs/:id",middleWare.checkBlogOwnership,function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	})
})	
//////////AUTH ROUTES
//show regoster form
app.get("/register",function(req,res){
	res.render("register");
})
//handle sign up logic
app.post("/register",function(req,res){
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
app.get("/login",function(req,res){
	res.render("login");
})
app.post("/login",passport.authenticate("local",{
	
	successRedirect:"/blogs",
	failureRedirect:"/login",
	
	
}),function(req,res){
	
	
});

app.get("/logout",middleWare.isLoggedIn,function(req,res){
	req.logout();
	req.flash("success","You have successfully logged out , GOOD BYE...");
	res.redirect("/blogs");
	
});//logout yapiliyor ama hala sayfaya erisim var bu yuzden





//commmennttt
app.post("/blogs/:id/comments",middleWare.isLoggedIn,function(req,res){
	
	Blog.findById(req.params.id,function(err,found){
		if(err){
			req.flash("error","We Couldn`t find the Campground");
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
					req.flash("success","Comment created successfully...");
					res.redirect("/blogs/"+found._id);
				}
			})
		}
	})
})
	
	////////////////////////////////////////////////////////////////////////
	//edit comment
app.get("/blogs/:id/comments/:comment_id/edit",middleWare.checkCommentOwnership,function(req,res){////////////////
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
app.put("/blogs/:id/comments/:comment_id",middleWare.checkCommentOwnership,function(req,res){
	
	req.body.text=req.sanitize(req.body.text);
	
	Comments.findByIdAndUpdate(req.params.comment_id,{text:req.body.text},function(err,update){
		if(err){
			req.flash("error","We couldn`t find the Comment");
			res.redirect("/blogs/"+req.params.id);
		}
		else{
			req.flash("success","Comment edited successfully...");
		res.redirect("/blogs/"+req.params.id);
	}
	})
})


//delete comment
app.delete("/blogs/:id/comments/:comment_id",middleWare.checkCommentOwnership,function(req,res){
	Comments.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			req.flash("error","We couldn`t remove the Comment");
			res.redirect("back");
		}
		else{
			req.flash("success","Comment removed successfully...");
			res.redirect("/blogs/"+req.params.id);
		}
	})
})	

	





app.listen(3000,function(){
	console.log("start");
});