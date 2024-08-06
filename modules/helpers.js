
//Get the id of user by token 
const getUserId = async (User, token) =>{
    const response = await User.findOne({token}); 
    return response ? response._id.toString() : null; 
}

module.exports = { getUserId };