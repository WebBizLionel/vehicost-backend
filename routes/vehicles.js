var express = require('express');
var router = express.Router(); 
const User = require('../models/users');
const Vehicle = require('../models/vehicles');
const { ObjectId } = require('mongoose').Types
const {  removeKeys } = require('../modules/helpers'); 

const checkRequestKey = require('../middlewares/checRequestKey');
const fileUploadMiddleware = require('../middlewares/fileUploadMiddleware');

/** 
 * @TODO
 * create translation file for multilinguisme
**/

router.get('/', function(req, res, next) {

    res.send('respond with a resource');

});

/* Get vehicles datas of user*/
router.get('/get/:_id?', async (req, res)=>{

    /**
     * Destructuration params
     * @params token, vehicle _id
     */
    const {_id} = req.params; 

    try { 

        // Get user id
        const user = req.user; 

        const query = _id ? {user_id:user, _id} : {user_id:user};
        const resDocs = await Vehicle.find(query).select('-user_id');

        const json = resDocs.length > 0
            ? { result: true, type: resDocs.length > 1 ? 'multiple' : 'unique', vehicles: resDocs, number_vehicles: resDocs.length }
            : { result: false, error: 'Vehicle not found' };

        res.json(json);    

    } catch(err) {
        console.log(err); 
        res.status(500).json({result:false, error:'An error has occurred'})

    }

}); 

/* Add a new vehicle */
router.post('/add', fileUploadMiddleware(), async (req, res) => {
 
    // Get user id
    const user = req.user; 
    
    // Add user directly in req.body
    req.body = {...req.body, user_id:user}

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

}); 

/**
 * REMOVE a vehicle
 * @param vehicle_id
 * Use req.param
 */
const delParams = {request:'params', key: ['vehicle_id']};
router.delete('/delete',checkRequestKey(delParams), async (req,res)=>{
    
    /**
    * Destructuration params
    * @params token, vehicle id
    */
    const {vehicle_id} = req.params; 

   // Get user id
   const user = req.user; 

    if(user) {

        //Find user's vehicles
        const deleteDoc = await  Vehicle.deleteOne({ $and:[ {user_id:user}, {_id:vehicle_id}]});
        const json = deleteDoc.deletedCount > 0 ? {result:true, message:`Vehicle ${vehicle_id} deleted`} : { result:false, error: `Vehicle ${vehicle_id} not found`};
        res.json(json);

    }else{

         // Bad request
         res.status(400).json({ result: false, error: 'User not found' });
    }

}); 

/**
 * UPDATE a vehicle
 * @param vehicle_id
 * Use req.param
 */
const updParams = {key: ['vehicle_id']};
router.put('/update',fileUploadMiddleware(),  async (req,res)=>{

    /**
    * Destructuration params
    * @params token, vehicle id
    */
    const {vehicle_id} = req.body; 

    // Check if file uploded
    const {uploaded} = req; 

     // Get user id
     const user = req.user; 

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
    
});

/*
 * EXPENSES
 */

/**
 * GET expense
 * @params vehicle_id, _id?
 * @query start_date, end_date or number_day 
 */
const getExpensesParam = {request:'params', key: ['vehicle_id']};
router.get('/expenses/get/:vehicle_id/:_id?', checkRequestKey(getExpensesParam), async (req, res) =>{

    /**
    * Destructuration params et query
    * @params vehicle_id, _id (expenses _id)
    * @query start_date, end_date
    */
   const {vehicle_id, _id} = req.params; 
   const {start_date, end_date, number_day} = req.query;

   /**
    * Create friendly dates
    */
   let startDate = start_date ? new Date(start_date) : null;
   let endDate = end_date ? new Date(end_date) : null; 

   //Get user id 
   const user = req.user; 

   /**
    * Create pipeline
    * Conditions : vehicule_id, _id of expenses, dates
    */

    const vehMatchConditions = {
        _id: new ObjectId(vehicle_id),
    }; 

    const expMatchConditions = {}; 
    
    // Add _id of expenses id call
    if(_id) {
        expMatchConditions['expenses._id'] = new ObjectId(_id);
    }

    // Add date expenses
    // Number of days
    if (number_day) {
        const daysAgo = parseInt(number_day, 10);
        endDate = new Date(); // Date actuelle
        startDate = new Date();
        startDate.setDate(endDate.getDate() - daysAgo); // Calcul de la date de début
    }

    // Create match with date or day
    if(startDate && endDate) {
        expMatchConditions['expenses._id.createdAt'] = {
            $gte:startDate, 
            $lte:endDate
        }
    }

    try {

        const expenseDoc =  await Vehicle.aggregate([
            {
                $match: vehMatchConditions
            },
            {
                $unwind: '$expenses'
            }, 
            {
               $match:expMatchConditions
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

        res.json({result:true, vehicle: expenseDoc}); 

    } catch(err) {
        
        console.log(err); 
        res.status(500).json({result:true, error:'An error has occurred'})

    }

}); 

/* Add an expenses */

/**
 * ADD expense
 * @params vehicle_id, expenses
 */

const addExpensesParam = {key: ['vehicle_id', 'expenses']};

/**
 * Middleware for file upload
 * 
 * @param {object} params key_url, key_name, subdocument, key_content_type, subkey
 */

router.post('/expenses/add',checkRequestKey(addExpensesParam), fileUploadMiddleware({key_url:'url', key_name:'name', subdocument:'expenses',key_content_type:'content_type',subkey:'receipt'}), async (req,res)=> {

   /**
    * Destructuration params
    * @params token, vehicle id
    */
   const {vehicle_id} = req.body; 

    // Check if file uploded
    const {uploaded} = req;  

    const user = req.user;

    try {

        const addExpense = await  Vehicle.updateOne({ $and:[ {user_id:user}, {_id:vehicle_id}]},{
    
                $push:{
                    expenses:{
                    ...req.body.expenses
                    }
                }

            }, 
            { runValidators: true} // Validate required field (cf schema)
        ); 
    
        res.json({result:true, expense:addExpense}); 

    }catch(err){

        console.log(err); 
        res.status(500).json({result:false, error:'An error has occurred'})

    }


}); 

/**
 * REMOVE expense
 * @param _id
 */

const delExpensesParam = {request:'params', key: ['_id']};
router.delete('/expenses/delete/:_id',checkRequestKey(delExpensesParam), async (req,res) =>{
    
   /**
    * Destructuration params
    * @param _id 
    */
    const {_id} = req.params

    //Get user id 
    const user = req.user; 

    try{

        /**
        * Make the request in single query
        */
        const docDeleted = await Vehicle.findOneAndUpdate(
            {'expenses._id':_id},
            {$pull: {expenses:{_id}}}, //Remove the expense
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
 
});

/**
 * UPDATE expenses
 * @param expenses_id
 */
const putExpensesParam = {key: ['expenses_id']};
router.put('/expenses/update',checkRequestKey(putExpensesParam), async(req,res) => {

    /**
    * Destructuration params
    * @param expenses:[{_id}]
    * @param expenses (expenses data to change)
    */
     const {expenses_id, expenses} = req.body

     //Get user id 
     const user = req.user
    
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

}); 

module.exports = router; 