var restify = require('restify');
var builder = require('botbuilder');
debug=1;
// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var epLuis="https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2b745525-b163-402c-aa81-b2454222274a?subscription-key=10d51623d5ea4cf0a97a3a1ea8457ebb&timezoneOffset=0&verbose=true&q=";
var sGreeting="Hi this is crashcart! How can I help you? You can type out your problem (I cannot print a file) or ask for an update on an existing ticket (what's the status of IN2030?) and I will respond";
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector,function(session){
						session.send("Hi");
					     }
);
var luisModel = process.env.LUIS_ENDPOINT;
bot.recognizer(new builder.LuisRecognizer(luisModel));

//If you have an Update request
bot.dialog('ServiceDesk.Update',[
	function(session,args,next){
		if(debug==1){session.send("Debug:In ServiceDesk.Update dialog");}
		var ticket=builder.EntityRecognizer.findEntity(args.intent.entities, 'ServiceDesk.TicketType');
		if(ticket){
			session.send("Finding the status of ticket :"+ticket.entity);
		}
		else{
			session.dialogData.TicketNumberProvided=false;
			session.beginDialog('ServiceDesk.Update/GetTicketNumber');
			//session.send("Finding the status of the ticket :"+session.dialogData.TicketNumber);
			
		}
		//session.send(luisModel);
		//var intent = args.intent;
		//session.send("Identified a request for an update for an incident"+args.intent);
	},
	function(session,results){
		if(session.userData.TicketNumber){
			session.send("Finding the status of the ticket :"+session.userData.TicketNumber);
		}
		else{
			session.send("Here are your tickets and ticket status"+session.userData.Tickets);
		}
	}
]).triggerAction({matches: 'ServiceDesk.Update'})
;

bot.dialog('ServiceDesk.Update/GetTicketNumber',[
	function(session,args,next){
		builder.Prompts.confirm("Do you have the ticket number handy?");
		
	}
	,
	/*
	function(session,results,next){
		if(results.response){
		   builder.Prompts.text(session,"Great. Can you enter the ticket number? It should start with a INC, SRQ or CHG and a 7 digit number");
		}
		else{	
		   session.send("No worries. I will look up your tickets on the ticketing tool...");
		   session.userData.Tickets=getTickets();
		}
	},*/
	function(session,results){
		console.log("The answer is:"+results.response);
		session.send("The answer is:"+results.response);
		if(results.response){
			
			session.userData.TicketNumber=results.response;
		}
		//session.endDialog();		

	}
		
]);
		
bot.dialog('ServiceDesk.Greet',[
function(session,args,next){
	if(debug==1){session.send("Debug:In the ServiceDesk.Greet dialog");}
	session.endDialog(sGreeting);
}
]).triggerAction({matches:'ServiceDesk.Greet'});

function getTickets(){
	//mock getTickets function
	return [1,2,3];
}
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
