const axios = require('axios'),
express = require('express'),
http = require('http'),
cors = require('cors'),
bodyParser = require('body-parser'),
crypto = require('crypto'),
assert = require('assert');
//get api routes
const lmk = require('./routes/lmk.js'),
yolo = require('./routes/yolo.js');

const app = express();
const api = express.Router();
const server = http.createServer(app);
server.listen(3280, () => { console.log('[!] HTTP Web server is online.')});
//use cross-origin resource sharing
app.use(cors());
//extract request body and parse to json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all('/', (req, res)=>{
    res.send('<br><p style="font-family:sans-serif; width:100%; text-align:center; font-size:16px">http://167.172.159.35:3280/yolo?code=<b>YOLO_CODE</b>&title=<b>MESSAGE_TITLE</b>&message=<b>MESSAGE</b>&number=<b>NUMBER_TO_SPAM</b> - replace the caps text with info wanted <br><br>http://167.172.159.35:3280/lmk?code=<b>LMK_CODE</b>&message=<b>MESSAGE</b>&number=<b>NUMBER_TO_SPAM</b></p>')
});

//use api routes
app.use('/yolo', yolo);
app.use('/lmk', lmk);

//catch all errors
app.use((err, req, res, next)=>{
    res.status(500).json({status:500, message: err.message});
});

module.exports = app;