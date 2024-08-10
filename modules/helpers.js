
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

const removeID = (model, key) => {
    //Remove all id of shema
    const modelSchema = model.schema;
    const removeId = [];
    for (const key in modelSchema.tree) {
      const path = modelSchema.paths[key]; 
      if (!path) continue;  // Skip paths that don't exist 
      if (path.instance === 'Array' && path.schema) {
        removeId.push(`-${key}._id`);
      } else if (path.instance === 'Embedded' || (path.caster && path.caster.instance === 'Embedded')) {
        removeId.push(`-${key}._id`);
      } 
    }

    return removeId; 
}

module.exports = { getUserId, keyRemoveAdd,  removeKeys, removeID};