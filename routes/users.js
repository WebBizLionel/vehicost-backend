var express = require('express');
var router = express.Router();
const checkRequestKey = require('../middlewares/checRequestKey');
const User = require('../models/users'); 
const { validateEmail } = require ('../modules/validateEmail'); 
const { removeID } = require('../modules/helpers');
const uid2 = require('uid2'); 
const bcrypt = require('bcrypt');

/** 
 * @TODO
 * create translation file for multilinguisme
**/

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Get user datas. */
router.get('/get/:token', async (req, res)  => {
    
    const token = req.params.token;
    try {

      /**
       * Same result but different synthaxe
       * 
          User.findOne({token}).select(['-password', '-email', '_id', '-__v']).then(data=> {
            res.json({result:true,user:data})
          }); 
       */
     
      const noSelect = ['-password', '-email', '_id', '-__v']; 
      const userDoc = await User.findOne({token}).select(noSelect); 

      if (userDoc) {
        res.json({result:true, user:userDoc}); 
      } else {
        res.json({result:false, user:'no data'})
      }
    
    } catch(err) {

      console.log(err)
      res.status(500).json({result:false, error:'An error has occurred'})

    }
   
});

/* Route Sign up (inscription)*/
/* Field : username, */
const signUpParams = {request:'body', key:['username', 'password', 'email']}; 
router.post('/signup',checkRequestKey(signUpParams), async (req, res) => {

    // Destructuration of req.body
    const {username, email, password, phone, accept_rgpd, promotion, country, language } = req.body; 

    // Check email validation
    if(!validateEmail(email)) {
      res.json({result:false, error:'Adresse e-mail non valie', notification:true})
      return; 
    }

    /**
     * Check if username or email already exist
     * Use find not findOne with $or condition
     */

    try {

      const userDoc = await User.findOne({$or: [{username}, {email}]}); 

      if(userDoc === null){
  
        // Hash Password & tokenify
        const hash = bcrypt.hashSync(password, 10);
  
        const newUser = new User({
          username, 
          email,
          password:hash, 
          token:uid2(32),
          phone, 
          accept_rgpd, 
          promotion, 
          country,
          preferences : { 
            promotion,
            language
          }
        });
  
        const newDoc = await newUser.save(); 
        res.json({result:true,username: newDoc.username, token:newDoc.token})
  
      } else {
  
        res.json({result:false, error:'Nom d\'utilisateur ou addresse e-mail déjà utilisé', notification:true})
  
      }

    }catch(err) {

      console.log(err)
      res.status(500).json({result:false, error:'An error has occurred'})

    }
   

}); 

/* Route Sign in (connexion) */
const signInParams = {request:'body', key:['username', 'password']}; 
router.post('/signin',checkRequestKey(signInParams), async (req, res)=> {

  //Destructuration req.body
  const {username, password} = req.body;

  try{
    // Check user exist
    const userDoc = await User.findOne({username});

    // Compare password field value from front to password data base 
    if (userDoc && bcrypt.compareSync(req.body.password, userDoc.password)) {

      res.json({ result: true, token: userDoc.token });

    } else {

      res.json({ result: false, error: 'Utlisateur non trouvé ou mauvais mot de passe' });

    }

  }catch(err) {
      console.log(err)
      res.status(500).json({result:false, error:'An error has occurred'})
  }
  
});

/**
 * @TODO
 * send token in header
 */
/* Route to update user */
const updateParam = {request:'body', key:['token']}; 
router.put('/update', checkRequestKey(updateParam), async (req, res) => {

    try{
     
      const token = req.body.token;

      //Search and return path of _id
      const removeId = removeID(User, '_id'); 

      const noSelect = ['-password', '-email', '-_id', '-__v','-token',...removeId]; 
      const userDoc = await User.findOneAndUpdate({token}, {$set: {...req.body}},{new:true}).select(noSelect);


      res.json({result:true, user:userDoc}); 
      
      
    
    }catch(err) {
      console.log(err)
      res.status(500).json({result:false, error:'An error has occurred'})
    }

});

/* Route to remove a user */

module.exports = router;
