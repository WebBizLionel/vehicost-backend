/** Modelisation of user datas **/
const mongoose = require('mongoose'); 

//Sub document
/** Preferences **/
const preferencesSchema = mongoose.Schema({
    language:{type:Boolean, default:null}, 
    currency:{type:String, default:"EUR"}, 
    notifications:{type:Boolean, default:true}, 
    promotion:Boolean,
}); 

/** Social Login  **/
/** @TODO refector **/
const snloginSchema = mongoose.Schema({
    google_id: {type:String,default:null}, 
    facebook_id: {type:String,default:null}, 
    apple_id: {type:String,default:null} 
})

/** @TODO 
 * Add favorite gas Station 
 * foreign key
 * **/

// Main Schema
const UserSchema = mongoose.Schema({
    username:{ 
        type: String, 
        required: [true, 'A username is required'],
        unique: true,
    }, 
    email:{
        type: String, 
        required: [true, 'An email adress is required'], 
        unique: true
    }, 
    password:{
        type: String, 
        required: [true, 'A password is required']
    }, 
    token: String, 
    phone:{
        type: String,
        default: null
    },
    country:{
        type: String, 
        default: null
    },
    accept_rgpd: Boolean, 
    preferences: preferencesSchema, 
    social_login: snloginSchema, 
}, {timestamps:true})

const User = mongoose.model('users', UserSchema); 

module.exports = User