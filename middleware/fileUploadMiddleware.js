export const fileUploadMiddleware = (cloudinary) => {
    return async (req, res, next) => {
        if (req.files) {
            try {
                const type = req.files.fileUpload.mimetype.split('/')[1];
                const filePath = `./tmp/${uniqid()}.${type}`;
                const resultFile = await req.files.fileUpload.mv(filePath);

                if (!resultFile) {
                    const resultCloudinary = await cloudinary.uploader.upload(filePath);
                    fs.unlinkSync(filePath);
                    const url = resultCloudinary.secure_url;
                    req.body = { ...req.body, image_url: url };
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

