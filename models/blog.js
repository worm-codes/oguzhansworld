var mongoose=require("mongoose");



var blogSchema=new mongoose.Schema({
	 author:{
		  id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String
	 },
	comments:[
		  {
			  type: mongoose.Schema.Types.ObjectId,
		       ref:"Comment"		  
		  }		  
	  ],
	title:String,
	image:String,
	body:String,
	created:{type:Date ,default:Date.now}
})
  module.exports=mongoose.model("Blog",blogSchema);