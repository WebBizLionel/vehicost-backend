/**
 * Authentification middleware
 * Validates the authentication token provided in the request.
 * 
 * @param {string} token - The authentification token to verify
 * 
 */

const User = require('../models/users');
const { getUserId } = require('../modules/helpers');  

const authMiddleware = async (req,res,next) => {

    try{
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; 

        if(!token) return res.status(401).json({result:false, error:'Token missing or invalid'})
        
        const userId = await getUserId(User, token); 

        if(userId) {
            req.user = userId;
            next()
        } else {
            res.status(404).json({result:false, error:'User not found'})
        }

    } catch(err) {
        console.log(err); 
        res.status(500).json({result:false, error:'An error has occurred'})
    }

    
}

module.exports = authMiddleware; 