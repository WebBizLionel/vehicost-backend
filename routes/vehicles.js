var express = require('express');
var router = express.Router(); 
const User = require('../models/users');
const Vehicle = require('../models/vehicles');
const { ObjectId } = require('mongoose').Types
const { getUserId, keyRemoveAdd, removeKeys } = require('../modules/helpers');  
const { checkBody } = require('../modules/checkBody'); 

const fileUploadMiddleware = require('../middleware/fileUploadMiddleware');

/** 
 * @TODO
 * create translation file for multilinguisme
**/

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* Get vehicles datas of user*/
router.get('/get/:token/:_id?', async (req, res)=>{

     /**
     * Check miminum param
     * @TODO change to middleware
     */
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
        res.status(500).json({result:false, error:'An error has occurred'})

    }

}); 

/* Add a new vehicle */
router.post('/add', fileUploadMiddleware(), async (req, res) => {
 
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

     /**
     * Check miminum param
     * @TODO change to middleware
     */
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
router.put('/update',fileUploadMiddleware(),  async (req,res)=>{

     /**
     * Check miminum param
     * @TODO change to middleware
     */
    if(!checkBody(req.body,['token', 'vehicle_id'])) {
        res.status(400).json({result:false, error:'Missing or empty field', notification:false}); 
        return; 
    } 

    /**
    * Destructuration params
    * @params token, vehicle id
    */
    const {token, vehicle_id} = req.body; 

    // Check if file uploded
    const {uploaded} = req; 

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
            res.status(500).json({result:false, error:'An error has occurred'})
        }

     } else {

        // Bad request
        res.status(400).json({ result: false, error: 'User not found' });

     }

});

/**
 * EXPENSES
 */

/*  Get expenses */
router.get('/expenses/get/:token/:vehicle_id/:_id?',async (req, res) =>{

    /**
    * Check miminum param
    * @TODO change to middleware
    */
     if(!checkBody(req.params,['token', 'vehicle_id'])) {
        res.status(400).json({result:false, error:'Missing or empty field', notification:false}); 
        return; 
    } 
    
    /**
    * Destructuration params
    * @params token, vehicle id
    */
   const {token, vehicle_id, _id} = req.params; 

   //Get user id 
   const user = await getUserId(User, token);

   if(user){

    try {

        /*const query = _id ? {'expenses.id': new Object(_id)} : {_id:vehicle_id} ; //Get vehicle or get directly expense

        const expenseDoc = await Vehicle.findById(query).select('-user_id'); */


        const expenseDoc =  await Vehicle.aggregate([
            {
                $match: {
                    _id: new ObjectId(vehicle_id),
                }
            },
            {
                $unwind: '$expenses'
            }, 
            {
               $match:{
                    'expenses._id' : new ObjectId('66b4ec8527acdbceef9bffe2')
                }
            },
            {
                $group: {
                    _id : vehicle_id,
                    total_cost: { $sum: '$expenses.amount'},
                    expense_number: { $count:{}}, 
                    expenses:{$push:'$expenses'}
                }
            }
        ])
    //C'est mieux d'être la boniche de maison ou d'être un sushi crevette ?
        res.json({result:true, vehicle: expenseDoc}); 

    } catch(err) {
        
        console.log(err); 
        res.status(500).json({result:true, error:'An error has occurred'})

    }

   


   }else{

     // Bad request
     res.status(400).json({ result: false, error: 'User not found' });

   }


}); 

/* Add an expenses */
/** @parameters: key_url, key_name, subdocument, subkey, key_content_type */
router.post('/expenses/add',fileUploadMiddleware({key_url:'url', key_name:'name', subdocument:'expenses',key_content_type:'content_type',subkey:'receipt'}), async (req,res)=> {
   
    /**
     * Check miminum param
     * @TODO change to middleware
     */
    if(!checkBody(req.body,['token', 'vehicle_id', 'expenses'])) {
        res.status(400).json({result:false, error:'Missing or empty field', notification:false}); 
        return; 
    } 

   /**
    * Destructuration params
    * @params token, vehicle id
    */
   const {token, vehicle_id} = req.body; 

    // Check if file uploded
    const {uploaded} = req;  

    const user = await getUserId(User, token); 
  
    if(user){ 

        try {

            const addExpense = await  Vehicle.updateOne({ $and:[ {user_id:user}, {_id:vehicle_id}]},{
        
                    $push:{
                        expenses:{
                        ...req.body.expenses
                        }
                    }
    
                }, 
                { runValidators: true} // Validate required field
            ); 
        
            res.json({result:true, expense:addExpense}); 

        }catch(err){

            console.log(err); 
            res.status(500).json({result:false, error:'An error has occurred'})

        }

    } else {

        // Bad request
        res.status(400).json({ result: false, error: 'User not found' });

    }

}); 

/* Remove an expenses */
router.delete('/expenses/delete',async (req,res) =>{
    
    /**
    * Check miminum param
    * @TODO change to middleware
    */
    if(!checkBody(req.body,['token', 'expenses_id'])) {
        res.status(400).json({result:false, error:'Missing or empty field', notification:false}); 
        return; 
    } 

   /**
    * Destructuration params
    * @params token, expenses:[{_id}]
    */
    const {token, expenses_id} = req.body

    //Get user id 
    const user = await getUserId(User, token); 

    if(user) {
        try{

            /**
            * Make the request in single query
            */
            const docDeleted = await Vehicle.findOneAndUpdate(
                {'expenses._id':expenses_id},
                {$pull: {expenses:{_id:expenses_id}}}, //Remove the expense
                {new:true} // Show actual doc Vehicle update
            ).select('-user_id'); 
            
            /**
             * Return 
             * Vehicle ID && expenses
             */
            res.json({result:true,vehicle: {_id: docDeleted._id, expenses:docDeleted.expenses}});    
    
        }catch(err){
    
            console.log(err); 
            res.status(500).json({result:false, error:'An error has occurred'})
    
        }
    } else {

        // Bad request
        res.status(400).json({ result: false, error: 'User not found' });

    }
     
});

/* Update an expenses */
router.put('/expenses/update', async(req,res) => {

     /**
     * Check miminum param
     * @TODO change to middleware
     */
     if(!checkBody(req.body,['token', 'expenses_id'])) {
        res.status(400).json({result:false, error:'Missing or empty field', notification:false}); 
        return; 
    } 

    /**
    * Destructuration params
    * @params token, expenses:[{_id}]
    */
     const {token, expenses_id, expenses} = req.body

     //Get user id 
     const user = await getUserId(User, token); 

    if(user){

        try {
            const query = {'expenses._id': new ObjectId(expenses_id)}
            const arrayFilters = [{"elem._id": new ObjectId(expenses_id)}]
            const update = {$set: {}}
            

            //Create $set object
            for (const key in expenses) {
                update["$set"][`expenses.$[elem].${key}`] = expenses[key]
            }
            
            // Query, update, option( array filter :determine which array elements to modify )
            const docUpdate = await Vehicle.findOneAndUpdate(query, update, { arrayFilters, new:true }).select(['-user_id']);

            res.json({result:true, vehicle_id:docUpdate._id, expenses:docUpdate.expenses});

        }catch(err){

            console.log(err); 
            res.status(500).json({result:false, error:'An error has occurred'})

        }
     

    }else{

        // Bad request
        res.status(400).json({ result: false, error: 'User not found' });

    }


}); 


module.exports = router; 