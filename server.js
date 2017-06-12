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
var bot = new builder.UniversalBot(connector,function(session){
	 session.send("Hi this is crashcart! How can I help you? You can type out your problem (I cannot print a file) or ask for an update on an existing ticket (what's the status of IN2030?) and I will respond");
});

var luisModel = process.env.LUIS_ENDPOINT||epLuis;
bot.recognizer(new builder.LuisRecognizer(epLuis));
bot.dialog('ServiceDesk.Update',[
	function(session,args,next){
		//session.send(luisModel);
		var intent = args.intent;
		session.send("Identified a request for an update for an incident"+args.intent);
	}
]).triggerAction({
    matches: 'ServiceDesk.Update',
    onInterrupted: function (session) {
        session.send('Please provide a destination');
    })
;
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
