// Importing required modules
const http = require('http'),
cors = require('cors'),
fs = require('fs'),
express = require('express'),
session = require('express-session'),
schedule = require('node-schedule'),
crypto = require('crypto'),
bodyParser = require('body-parser'),
api = require('./api/api.js'),
auth = require('./api/auth.js'),
game = require('./api/game.js'),
settings = require('./api/settings.js'),
user = require('./api/user.js'),
payments = require('./api/payments.js'),
referrals = require('./api/referrals.js'),
mongooseMulti = require('mongoose-multi'),
dbConfig = require('./db/config.js').db,
dbSchemas = require('./db/schemas.js'),
MultiPotSystem = require('./lib/multipot-game.js'),
passport = require('passport'),
{apiRateLimit, gameRateLimit, setRefCodeRateLimit, createDepositRateLimit, getDepositInfoRateLimit} = require('./lib/ratelimit.js'),
SteamStrategy = require('passport-steam').Strategy,
sharedsession = require("express-socket.io-session"),
config = require('./config.js');
//db connection
const db = mongooseMulti.start(dbConfig, dbSchemas);

const app = express();
const server = http.createServer(app);
server.listen(3000, () => { console.log('[!] HTTP Web server is online.')});
const io = require('socket.io')(server);

// START MULTIPOT GAME FUNCTIONS
const MultiPot = new MultiPotSystem({io});

//use cross-origin resource sharing
app.use(cors());
//extract request body and parse to json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//catch errors
app.use((err, req, res, next)=>{
  const { statusCode, message } = err;
  res.status(statusCode).json({status: statusCode, message: message});
});

app.all('/', (req, res)=>{
  res.status(401).send('');
});

//session middewear
app.use(session({
  secret: 'somerandomsecretkeybecauseitdoesntmatter',
  name: 'session_id',
  resave: true,
  saveUninitialized: true,
}));

//steam passport authentication
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(new SteamStrategy({
  returnURL: `${config.website}/auth/login/return`,
  realm: `${config.website}/`,
  apiKey: config.apiKey
 },(identifier, profile, done)=>{
   process.nextTick(()=>{
     profile.identifier = identifier;
     return done(null, profile);
   });
}));

//use api routes
app.use('/api', apiRateLimit);
app.use('/api', api);

//use auth Routes
app.use('/auth', auth);
//use game routes (game info)
app.use('/api/game', game);
//settings rate limit for /api/s/setReferral
app.use('/api/s/setreferral', setRefCodeRateLimit);
//settings routes for users to change profile settings
app.use('/api/s', settings);
//user routes to get user information from
app.use('/api/u', user);
//deposit rate limits
app.use('/api/p/new', createDepositRateLimit);
app.use('/api/p/check', getDepositInfoRateLimit);
//payment routes
app.use('/api/p', payments);
//referral rate limit
app.use('/api/r/getstats', referralRateLimit);
//referral routes
app.use('/api/r', referrals);

//catch all errors
app.use((err, req, res, next)=>{
  res.status(500).json({status:500, message: err.message});
});
//catch 404 errors
app.use((req, res, next) => {
  //set status code
  res.status(404).json({status: 404, message: 'That route was not found.'})
});

//stats for users connected to the site
var connectionStats = {
  connected: 0,
  peakConnected: 0,
  timestamp: new Date().toUTCString(),
}

//log user stats every hour
const logJob = schedule.scheduleJob('* 1 * * *', async ()=>{
  //get new hour timestamp
  let newDate = new Date().toUTCString();
  //save peak connections info to db
  await new db.gamble.connectionStats({
    peakConnected: connectionStats.peakConnected,
    timestamp: connectionStats.timestamp
  }).save(() => { //when it saves reset object vars
    connectionStats.peakConnected = connectionStats.connected;
    connectionStats.timestamp = newDate;
  });
});
//share express session (steam passport) with socketio
io.use(sharedsession(session, {autoSave:true }));
//socketio "routes"
io.on('connection', async (socket)=>{
  //middlewear to catch errors
  socket.use((packet, next)=>{
    console.log(packet);
    next(new Error(packet));
  })
  //add user to total connected
  connectionStats.connected++;
  //if total users connected is the peak for hour then set peak
  if(connectionStats.connected > connectionStats.peakConnected) connectionStats.peakConnected = connectionStats.connected;
  //run when user disconnects
  socket.on('disconnect', ()=>{
    //remove user from total connected
    connectionStats.connected--;
  });
  //get game info
  let gameInfo = await MultiPot.getGame();
  //emit game info
  socket.emit('game_info', gameInfo);
  //listen for client emitting a bet
  socket.on('place_bet', async (params)=>{
    let betInfo = await MultiPot.placeBet(user, params)
    .then((res)=> io.emit('betInfo', res))
    .catch((err)=> socket.emit('clientErr', err));
  });
});

//function to check if the client is logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(403);
  res.json({status: 403, message: 'You must be logged in to retrieve this route.'});
}

//catch unhandled exceptions
process.on('uncaughtException', function (err) {
  console.log(err);
});

process.on('unhandledPromiseRejection', function (err) {
  console.log(err);
});

module.exports = app;
