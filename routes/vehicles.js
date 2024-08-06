var express = require('express');
var router = express.Router(); 
const User = require('../models/users');
const Vehicle = require('../models/vehicles');
const { getUserId } = require('../modules/helpers');  

/** 
 * @TODO
 * create translation file for multilinguisme
**/

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* Get vehicles datas of user*/
router.get('/:token/:number', (req, res)=>{



}); 


/* Add a new vehicle */
router.post('/add', (req, res) => {

    const token = req.body.token; 

    //Get user id 
    getUserId(User, token).then(user => {
       
        if(user) {

            //Create new vehicles
            // Get front datas
            const newVehicles = new Vehicle({
               user_id : user
            }); 

            newVehicles.save().then(newDoc =>{
                res.json({result:true,vehicle:newDoc}); 
            }); 

        } else {
            res.json({result:false, error:'User not found'})
        }


    }); 
    

}); 

/* Update a vehicle*/
route.post('/delete',(req,res)=>{

}); 


/* Remove a vehicle */
/* Add an expenses */
/* Remove an expenses */
/* Update an expenses */



module.exports = router; 
  