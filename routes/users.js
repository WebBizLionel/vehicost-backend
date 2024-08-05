var express = require('express');
var router = express.Router();
const User = require('../models/users'); 
const { checkBody } = require('../modules/checkBody'); 
const { validateEmail } = require ('../modules/validateEmail'); 
const uid2 = require('uid2'); 
const bcrypt = require('bcrypt');

/** 
 * @TODO
 * create translation file for multilinguisme
**/

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Route Sign up (inscription)*/
/* Field : username, */
router.post('/signup', (req, res) => {

    // Check for minimum field
    if(!checkBody(req.body,['username', 'password', 'email'])) {
      res.json({result:false, error:'Oups ! Certains champs sont manquants ou vides.', notification:true}); 
      return; 
    }

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
    User.findOne({$or: [{username}, {email}]}).then(data=> {

      if(data === null) {

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

        newUser.save().then(newDoc =>{
          res.json({result:true,token:newDoc.token})
        }); 
        
       
      }else {
        res.json({result:false, error:'Nom d\'utilisateur ou addresse e-mail déjà utilisé', notification:true})
      }

    })

}); 


/* Route Sign in (connextion) */
router.post('/signin', (req, res)=> {

  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false,  error:'Oups ! Certains champs sont manquants ou vides.', notification:true});
    return;
  }

  //Destructuration req.body
  const {username, password} = req.body;

  // Check user exist
  User.findOne({ username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'Utlisateur non trouvé ou mauvais mot de passe' });
    }
  })




}); 

module.exports = router;
