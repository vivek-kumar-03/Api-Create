const mongoose  = require("mongoose");

const UserSchema = new mongoose.Schema({
    name : {type : String , required :  true },
    age: {type : Number , reqired : true},
    email : {type : String },
    address : {type : String} ,
    password : {type : String},
    otp : {type : String}
})


module.exports = mongoose.model("RegUser" , UserSchema);