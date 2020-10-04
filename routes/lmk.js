const express = require('express'),
axios = require('axios'),
assert = require('assert');

const lmk = express.Router();

const lmkSpam = async (code, message, num)=>{
    //check all parameters to be valid
    assert(code, 'You must include a LMK message code to spam.')
    assert(message, 'You must include a message for the spam.');
    assert(num, 'You must include a number of messages to spam');
    if(isNaN(num)) throw new Error('The "num" param must be a whole number');
    num = Number(num).toFixed(0);
    assert(num <= 100, 'You cannot spam more than 100 messages at a time.');
    //run loop for amount said
    var iteration = 1
    var interval = setInterval(()=>{
        if(iteration == num) clearInterval(interval);
        //send post request to lmk
        axios.post(`https://api.lmk.chat/questions/${code}/answer`, { message: message, webSessionId: code })
        .then((res)=>console.log(`Sent Message ${iteration}`))
        .catch((err)=>{throw new Error(err)});
        iteration++;
    }, 100);
    return `${num} messages successfully sent to victim.`
};

lmk.all('/', (req, res, next)=>{
    lmkSpam(req.query.code, req.query.message, req.query.number)
    .then((response)=> res.status(200).json({status: 200, message: response}))
    .catch(next);
});

module.exports = lmk;
