const mongoose = require('mongoose'); 

//Sub document
/** Preference **/
const preferencesSchema = mongoose.Schema({
    language:String, 
    currency:String, 
    notifications:Boolean, 
    promotion:Boolean
}); 

/** Social Login  **/
/** @TODO refector **/
const snloginSchema = mongoose.Schema({
    google_id: String, 
    facebook_id:String, 
    apple_id:String, 
})


// Main Schema
const UserSchema = mongoose.Schema({
    username:{ 
        type: String, 
        required:[true, 'A username is required'],
        unique:true,
    }, 
    email:{
        type:String, 
        required:[true, 'An email adress is required'], 
        unique:true
    }, 
    password:{
        type:String, 
        required:[true, 'A password is required']
    }, 
    token: String, 
    phone:String, 
    create_at: {
        type:Date, 
        default:Date.now
    }, 
    accept_rgpd:Boolean, 
    preferences:preferencesSchema, 
    social_login:snloginSchema, 
})

const User = mongoose.model('users', UserSchema); 

module.exports = User