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
//export yazip variable esitlersek enviromental variable olustururuz aynisini "heroku config:set" yazip olustururuz yani bi herokuda birde burda degisken olusturmus oluruz ama farkli degerlerde ayni isimde
var url = process.env.DATABASEURL || "mongodb://localhost/blog_app";
//or kismindan sonrasi back up database patlarsa falan burdaki database i yolluyoruz degisken olusturmamizin nedeni ise database user passsword kismi gorunmesin diye


mongoose.connect(url,{
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log("connected DB");
}).catch(err =>{
	console.log("ERROR :",err.message);
});
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


var blogRoutes=require("./routes/blog");
var authRoutes=require("./routes/auth");
var commentRoutes=require("./routes/comments");

app.use("/blogs",blogRoutes);
app.use("/blogs/:id/comments",commentRoutes);
app.use("/",authRoutes);



app.get("/",function(req,res){
	res.redirect("/blogs");
})

app.get("/aboutme",function(req,res){
	res.render("aboutme");
})

app.get("*",function(req,res){
	res.render("errorpage");
})
//important
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});