const express = require('express');
const router = express.Router();
const ipfsClient = require('ipfs-http-client');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');

const ipfs = ipfsClient('http://127.0.0.1:5001');

router.use(fileUpload({createParentPath: true}));

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));


const addFile = async(req) => {
    const file = {
        content: Buffer.from(req.data)
    };
    const fileAdded = await ipfs.add(file)
    return fileAdded[0].hash;
}

/**
     * @route POST ipfs/upload
     * @desc This method will upload new images to the ipfs 
     * @access Public
     *
     */
router.post('/upload', async(req, res) => {
    console.info("readingfile")
      try {
          if (!req.files) {
              res.send({status: false, message: 'No file uploaded'});
          } else {
              let image = req.files.image;
              const fileHash = await addFile(image);
              return res.json({
                  'data': {
                      'link': `http://api.appezite.com:8080/ipfs/${fileHash}`
                  }
              })
          }
      } catch (err) {
          console.log(err)
          res
              .status(500)
              .send(err);
      }
  });
  
  
  /**
     * @route POST ipfs/uploadapk
     * @desc This method will upload apk files to the ipfs 
     * @access Public
     *
     */
  router.post('/uploadapk', async(req, res) => {
      console.log(req.files)
      try {
          if (!req.files) {
              res.send({status: false, message: 'No file uploaded'});
          } else {
              let apk = req.files.apk;
              const fileHash = await addFile(apk);
              return res.json({
                  'data': {
                      'link': `http://api.appezite.com:8080/ipfs/${fileHash}`
                  }
              })
          }
      } catch (err) {
          console.log(err)
          res
              .status(500)
              .send(err);
      }
  });
  
  


module.exports = router;