const uniqid = require('uniqid'); 
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * 
 * @param {options} 
 * @returns 
 */

const fileUploadMiddleware = (opts={key_url:'image_url', key_name:'image_name', subdocument:null}) => {

    return async (req, res, next) => {

        if (req.files) {
            try {

                const type = req.files.fileUpload.mimetype;
                const name = req.files.fileUpload.name; 

                const filePath = `./tmp/${uniqid()}.${type.split('/')[1]}`;
                const resultFile = await req.files.fileUpload.mv(filePath);

                if (!resultFile) {

                    const resultCloudinary = await cloudinary.uploader.upload(filePath);
                    fs.unlinkSync(filePath);
                    const url = resultCloudinary.secure_url;


                    if(opts.subdocument){

                        /**
                         * @TODO
                         * refactor
                         * get object path with parameter
                         */

                        const fileObject = {
                            [opts.key_url]: url,
                            [opts.key_name]: name,
                            [opts.key_content_type]: type
                        }

                        req.body[opts.subdocument] = {...req.body[opts.subdocument], [opts.subkey]: { ...(req.body[opts.subdocument]?.[opts.subkey] || {}), ...fileObject }};

                    } else {
                        
                        req.body = { ...req.body, [opts.key_url]: url, [opts.key_name]:name}

                    }
                   
                    req.uploaded = true;

                } else {

                    req.uploaded = false;

                }
            } catch (err) {
                console.log(err);
                res.status(500).json({ result: false, error: 'An error has occurred during file upload' });
                return;
            }
        }
        next();
    };
};

module.exports = fileUploadMiddleware; 