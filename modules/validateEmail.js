/* Use to check if string is an email 
   Use on front too
*/
const validateEmail = (string = null) => {
    if(!string) {
        return; 
    }

    const reg =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return reg.test(string); 

}

module.exports = { validateEmail };