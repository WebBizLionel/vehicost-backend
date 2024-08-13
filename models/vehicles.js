/** Modelisation of vehicle datas **/
const mongoose = require('mongoose'); 

//Subdocument

/** Place of expense **/
const placeSchema = mongoose.Schema({
    place_name: String, 
    longitude: Number, 
    latitude:Number
});

/** Coverage periode **/
const coveragePeriod = mongoose.Schema({
    start_date: Date,
    end_date: Date, 
}); 

/* Receipt */
const receiptSchema = mongoose.Schema({
    name:String,
    type: String, 
    url:{type:String, required:[true, 'A file is required']}
})

/**
 * Expenses
 * Allows the addition of expense details here.
 **/
const expensesSchema = mongoose.Schema({
    category: {type:String,required:[true, 'A type of expense is required']},
    type: String, 
    amount: { type:Number, required:[true, 'A amount of expense is required']},
    currency: String, 
    note: String, 
    receipt:[receiptSchema],
    provider: String, 
    place: placeSchema,
    fuel_type: String, 
    full_tank: Boolean, 
    liters: Number,
    liter_price: Number, 
    mileage: Number, 
    repeat_cost: {type:Boolean, default:false},
    coverage_period:coveragePeriod, 
}, { timestamps: true })

/** Preferences **/
const preferencesSchema = ({
    active:{type:Boolean, default:true}
});

/** Infos **/
const infosSchema = ({
    mileage:Number, 
    mileage_unit:{type:String, default:'Kilometres'}, 
    purchase_Date:Date, 
    fuel: String, 
    sub_fuel: String,
    consumption: Number
}); 

const vehicleSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        default: 'Vehicule'
    }, 
    description: String, 
    image_url: String,
    image_name: String, 
    user_id:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        required:[true, 'User not found. Unable to add vehicle. Operation aborted.'] 
    }, 
    licence_plate: {type:String,unique:true},
    vin:{type:String, unique:true}, 
    type:{
        type: String, 
        required: true, 
        default: 'car'
    },
    brand: String, 
    model: String, 
    motorization: String, 
    insurance_policy: String, 
    infos:infosSchema,
    preferences:preferencesSchema,
    expenses:[expensesSchema], 
},{ timestamps: true });

const Vehicle = mongoose.model('vehicles', vehicleSchema)

module.exports = Vehicle; 
