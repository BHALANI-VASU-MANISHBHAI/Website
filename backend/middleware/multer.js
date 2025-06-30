import multer from "multer";


const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    // this calback is used to set the file name
    //null means no error
    //file.originalname is the name of the file --> this name store in server
    callback(null, file.originalname);
  }
});
//this is make instance of multer
const upload = multer({ storage });

export default upload;
