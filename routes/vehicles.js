var express = require('express');
var router = express.Router(); 
const User = require('../models/users');
const Vehicle = require('../models/vehicles');
const { getUserId, keyRemoveAdd, removeKeys } = require('../modules/helpers');  
const { checkBody } = require('../modules/checkBody'); 
const uniqid = require('uniqid'); 
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { fileUploadMiddleware } = require('../middleware/fileUploadMiddleware');


/** 
 * @TODO
 * create translation file for multilinguisme
**/

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* Get vehicles datas of user*/
router.get('/get/:token/:_id?', async (req, res)=>{

    // Check for minimum params
    if(!checkBody(req.params,['token'])) {
        res.status(400).json({result:false, error:'Oups ! Certains champs sont manquants ou vides.', notification:true}); 
        return; 
    }

    /**
     * Destructuration params
     * @params token, vehicle _id
     */
    const {token, _id} = req.params; 

    try { 

        // Get user id
        const user = await getUserId(User, token);

        if (user){

            const query = _id ? {user_id:user, _id} : {user_id:user};
            const resDocs = await Vehicle.find(query).select('-user_id');

            const json = resDocs.length > 0
                ? { result: true, type: resDocs.length > 1 ? 'multiple' : 'unique', vehicles: resDocs, number_vehicles: resDocs.length }
                : { result: false, error: 'Vehicle not found' };

            res.json(json);    
 
        } else {

            res.status(400).json({ result: false, error: 'User not found' });

        }

    } catch(err) {
        console.log(err); 
        res.status(500).json({result:true, error:'An error has occurred'})

    }

}); 



/* Add a new vehicle */
router.post('/add', fileUploadMiddleware(cloudinary), async (req, res) => {
 
    if(!checkBody(req.body,['token'])) {
        res.status(400).json({result:false, error:'Oups ! Certains champs sont manquants ou vides.', notification:true}); 
        return; 
    }

    /**
    * Destructuration params
    * @params ...req.body 
    */
    const {token} = req.body; 

    // Get user id 
    const user = await getUserId(User, token); 

    if(user) {

        // Replace token by user_id
        req.body = keyRemoveAdd(req.body, 'token', {user_id:user})

            try{

                //Add a new vehicle
                const newVehicle = new Vehicle({
                    ...req.body
                }); 
    
                const newDoc = await newVehicle.save();
    
                // Remove element of object
                const newDocObj = removeKeys(newDoc,['user_id']);
    
                // Response
                newDoc && res.json({result:true, vehicle:newDocObj}); 

            } catch(err) {
                console.log(err); 
                res.status(500).json({result:true, error:'An error has occurred'})
            }

    } else {

        // Bad request
        res.status(400).json({ result: false, error: 'User not found' });

    }

}); 

/* remove a vehicle*/
router.delete('/delete', async (req,res)=>{

    // Check minium param
    if(!checkBody(req.body,['token', 'vehicle_id'])) {
        res.status(400).json({result:false, error:'Oups ! Certains champs sont manquants ou vides.', notification:true}); 
        return; 
    }
    
    /**
    * Destructuration params
    * @params token, vehicle id
    */
    const {token, vehicle_id} = req.body; 

    // Get user id
    const user = await getUserId(User, token); 

    if(user) {

        //Find user's vehicles
        const deleteDoc = await  Vehicle.deleteOne({ $and:[ {user_id:user}, {_id:vehicle_id}]});
        const json = deleteDoc.deledCount > 0 ? {result:true, message:`Vehicle ${vehicle_id} deleted`} : { result:false, error: `Vehicle ${vehicle_id} not found`};
        res.json(json);

    }else{

         // Bad request
         res.status(400).json({ result: false, error: 'User not found' });
    }

}); 

/* Update a vehicle */
router.put('/update',fileUploadMiddleware(cloudinary),  async (req,res)=>{

    // Check minium param
    if(!checkBody(req.body,['token', 'vehicle_id'])) {
        res.status(400).json({result:false, error:'Missing or empty field', notification:false}); 
        return; 
    } 

    // Destructuration  
    const {token, vehicle_id} = req.body; 

     // Get user id
     const user = await getUserId(User, token); 

     if (user) {

        // Replace token by user_id
        req.body = keyRemoveAdd(req.body, 'token', {user_id:user});

        try{

            const updateVehicle = await Vehicle.updateOne({ $and:[ {user_id:user}, {_id:vehicle_id}]}, {
                ...req.body
            }); 

            const json = updateVehicle.modifiedCount> 0 ? {result:true, message:`Vehicle ${vehicle_id} updated`} : { result:false, error: `Vehicle ${vehicle_id} not found`};

            res.json(json);


        } catch(err) {
            console.log(err); 
            res.status(500).json({result:true, error:'An error has occurred'})
        }

     } else {

        // Bad request
        res.status(400).json({ result: false, error: 'User not found' });

     }


});

/* Add an expenses */

/* Remove an expenses */

/* Update an expenses */



module.exports = router; 
  