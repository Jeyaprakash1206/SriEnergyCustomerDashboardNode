let express = require('express');
var cors = require('cors');
let router = express.Router();
router.use(cors())
var bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
 
const awsWorker = require('../controllers/s3.controller.js');
 
router.post('/api/download/:filename', awsWorker.doDownload);
router.post('/api/directories', awsWorker.listdirectories);
router.post('/api/allfiles', awsWorker.allfiles);
router.post('/login', awsWorker.login);
router.get('/api/downloadFolder',awsWorker.downloadFolder);
// router.post('/', function (req, res) {
//     res.send('POST request to the homepage')
//   })
  
 
module.exports = router;