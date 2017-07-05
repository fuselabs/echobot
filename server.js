var restify = require('restify');
var builder = require('botbuilder');

/*
Refactor log functions
*/
const util=require('util');
const debug=1;

function logThis(results){
	if(debug==1){
	console.log(util.inspect(results));
	}
}
// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var sGreeting="Hi this is crashcart! How can I help you? You can type out your problem (I cannot print a file) or ask for an update on an existing ticket (what's the status of IN2030?) and I will respond";
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector,function(session){
						session.send("Hi");
					     }
);

//Set CHEEP's persistConversationData parameters
bot.set('persistConversationData',false);

//Import the necessary libararies
bot.library(require('./itsm/servicenow/helper').createLibrary());
bot.library(require('./botframework/prompts/helper').createLibrary());
bot.library(require('./convs/ServiceDesk/helper').createLibrary());

//Set the LUIS endpoint model and restrict calls to it within the dialog
var luisModel = process.env.LUIS_ENDPOINT;
var recognizer=new builder.LuisRecognizer(luisModel).onEnabled(function(context,callback){
	if(context.dialogStack().length===0){
		callback(null,true);
	}
	else{
		callback(null,false);
	}
});
bot.recognizer(recognizer);


// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.get(/\/convs\/ServiceDesk\/?.*/,restify.serveStatic({
	'directory': _dirname+'convs/ServiceDesk/',
	'file':'index.html'
}));
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
