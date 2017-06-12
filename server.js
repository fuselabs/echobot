var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var epLuis="https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2b745525-b163-402c-aa81-b2454222274a?subscription-key=10d51623d5ea4cf0a97a3a1ea8457ebb&timezoneOffset=0&verbose=true&q=";
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);
var luisModel = process.env.LUIS_ENDPOINT||'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c413b2ef-382c-45bd-8ff0-f76d60e2a821?subscription-key=6d0966209c6e4f6b835ce34492f3e6d9';
bot.recognizer(new builder.LuisRecognizer(luisModel));

bot.dialog('/', function (session) {
    
    //respond with user's message
    session.send("Hi this is crashcart! How can I help you? You can type out your problem (I cannot print a file) or ask for an update on an existing ticket (what's the status of IN2030?) and I will respond");
});

bot.dialog('/ServiceDesk.Update',function(session,args,next){
	var intent = args.intent;
	session.send("Identified a request for an update for an incident"+args.intent);
});
// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
