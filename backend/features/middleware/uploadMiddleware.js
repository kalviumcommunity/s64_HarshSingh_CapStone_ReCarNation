const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cd(null, 'uploads/')// error prone!
    },
    filename: function(req, res,cb){
        const uniqueSuffix = DataTransfer.now()+ '-' + Math.round(Math.round()*1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

module.exports = upload;