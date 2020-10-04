const axios = require('axios'),
crypto = require('crypto'),
assert = require('assert'),
readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const yoloSpam = async (code, message, num)=>{
    //run loop for amount said
    var iteration = 1
    var interval = setInterval(()=>{
<<<<<<< HEAD
        if(iteration == num) clearInterval(interval);
=======
        if(iteration > num) clearInterval(interval);
>>>>>>> 1f9a69cf33fea4afdc0462888a6adeda8a969cc0
        //generate random hex for cookie
        let cookie = crypto.randomBytes(8).toString('hex');
        //send post request to yolo
        axios.post(`https://onyolo.com/${code}/message`, { text: message, cookie: cookie, wording: 'Rekt by Sampli' });
        console.log(`Sent Message ${iteration}`);
        iteration++;
    }, 100);
};

const lmkSpam = async (code, message, num)=>{
    //run loop for amount said
    var iteration = 1
    var interval = setInterval(()=>{
<<<<<<< HEAD
        if(iteration == num) clearInterval(interval);
=======
        if(iteration > num) clearInterval(interval);
>>>>>>> 1f9a69cf33fea4afdc0462888a6adeda8a969cc0
        //send post request to lmk
        axios.post(`https://api.lmk.chat/questions/${code}/answer`, { message: message, webSessionId: code });
        console.log(`Sent Message ${iteration}`);
        iteration++;
    }, 100);
};

const startProgram = async()=>{
    //get all input fields and check if valid
    rl.question("Choose an option to spam:\n1 = YOLO\n2 = LMK\n", (choice)=>{
        rl.question("Input yolo or lmk code\n", (code)=>{
            rl.question("Input message to spam\n", async (message)=>{
                rl.question("Input number of messages to spam\n", async (num)=>{
<<<<<<< HEAD
                rl.close();
=======
                    rl.close();
>>>>>>> 1f9a69cf33fea4afdc0462888a6adeda8a969cc0
                if(isNaN(num)) throw new Error('The number of messages must be a whole number');
                num = Number(num).toFixed(0);
                assert(num <= 100, 'You cannot spam more than 100 messages at a time.');
                //run function per each
                if(choice == 1) await yoloSpam(code, message, num).catch(console.log);
                if(choice == 2) await lmkSpam(code, message, num).catch(console.log);
                return 'Finished spamming';
                });
            });
        });
    });
}

startProgram()
.then(console.log)
.catch(console.log)
<<<<<<< HEAD
    
=======
    
>>>>>>> 1f9a69cf33fea4afdc0462888a6adeda8a969cc0
