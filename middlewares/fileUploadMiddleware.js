const uniqid = require('uniqid'); 
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const fileUploadMiddleware = (options={}) => {

    const { key_url = 'image_url', key_name = 'image_name'} = options; 

    return async (req, res, next) => {
        if (req.files) {
            try {

                const type = req.files.fileUpload.mimetype.split('/')[1];
                const name = req.files.fileUpload.name; 

                const filePath = `./tmp/${uniqid()}.${type}`;
                const resultFile = await req.files.fileUpload.mv(filePath);

                if (!resultFile) {
                    const resultCloudinary = await cloudinary.uploader.upload(filePath);
                    fs.unlinkSync(filePath);
                    const url = resultCloudinary.secure_url;
                    req.body = { ...req.body, [key_url]: url, [key_name]:name };
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