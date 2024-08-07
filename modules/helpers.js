
//Get the id of user by token 
const getUserId = async (User, token) =>{
    const response = await User.findOne({token}); 
    return response ? response._id.toString() : null; 
}

const keyRemoveAdd = (obj, key, obj2) => {

    if (obj && key && obj2) {
        const { [key]: removedKey, ...rest } = obj; 
        return { ...rest, ...obj2 };
    } else {
        return obj;
    }

};

const removeKeys = (obj, keys) => {

    if(obj && keys) {
        const newObj = obj.toObject(); 
        keys.forEach(key => {
            delete newObj[key];
        });
        return newObj;
    } else {
        return obj;
    }
  
};

module.exports = { getUserId, keyRemoveAdd,  removeKeys};