const express = require('express'),
axios = require('axios'),
crypto = require('crypto'),
assert = require('assert');

const yolo = express.Router();

const runSpammer = async(code, title, message, num)=>{
    var iteration = 1
    var interval = setInterval(()=>{
        if(iteration == num) clearInterval(interval);
        //generate random hex for cookie
        let cookie = crypto.randomBytes(8).toString('hex');
        //send post request to yolo
        axios.post(`https://onyolo.com/${code}/message`, { text: message, cookie: cookie, wording: title })
        .catch((err)=>{
            if(err.response.status == 403) throw new Error('Your IP is currently ratelimited by YOLO. Please wait atleast 15 minutes.');
        });
        iteration++;
    }, 100);
}

const yoloSpam = async (code, title, message, num)=>{
    //check all parameters to be valid
    assert(code, 'You must include a yolo message code to spam.')
    assert(title, 'You must include a title for the message spam.');
    assert(message, 'You must include a message for the spam.');
    assert(num, 'You must include a number of messages to spam');
    if(isNaN(num)) throw new Error('The "num" param must be a whole number');
    num = Number(num).toFixed(0);
    assert(num <= 100, 'You cannot spam more than 100 messages at a time.');
    //run one post to test if blacklisted
    let success = null;
    await axios.post(`https://onyolo.com/${code}/message`, { text: message, cookie: cookie, wording: title })
    .then((res)=>{
        success = true;
        runSpammer(code, title, message, num);
    })
    .catch((err)=>{
        if(err.response.status == 403) throw new Error('Your IP is currently ratelimited by YOLO. Please wait atleast 15 minutes.');
    });
    //check vars and return to client
    if(success) return `${num} messages successfully sent to victim.`
};

yolo.all('/', (req, res, next)=>{
    yoloSpam(req.query.code, req.query.title, req.query.message, req.query.number)
    .then((response)=> res.status(200).json({status: 200, message: response}))
    .catch(next);
});

module.exports = yolo;
