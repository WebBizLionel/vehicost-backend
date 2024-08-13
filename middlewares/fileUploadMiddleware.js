const uniqid = require('uniqid'); 
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * Middleware for file  uploads (images or other files)
 * @returns uri
 */


const fileUploadMiddleware = () => {

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
                    
                    req.uploaded = true 
                    req.fileobject = { url, name, type}

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