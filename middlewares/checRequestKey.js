
/**
 * Middleware for validating parameters sent from the front end
 * Checks the request body for required keys and configurations.
 * 
 * * @param {object} options - Configurations (request, array, message)
 */

const { checkBody } = require('../modules/checkBody'); 

const checkRequestKey = (options = {}) => {
    return (req, res, next)  => {

        const defaultOpts = {
            request : 'body', 
            key:[], 
            msg: 'Oups ! Certains champs sont manquants ou vides.',
        }

        const opts = {...defaultOpts, ...options}; 
        
        if(!checkBody(req[opts.request], opts.key)) {

            res.status(400).json({result:false, error:opts.msg, notification:opts.notification});

        } else {
            next(); 
        }

    } 
}

module.exports = checkRequestKey; 