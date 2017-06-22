var restify = require('restify');
var builder = require('botbuilder');
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
bot.set('persistConversationData',false);
bot.library(require('./itsm/servicenow/helper').createLibrary());
var luisModel = process.env.LUIS_ENDPOINT;
bot.recognizer(new builder.LuisRecognizer(luisModel));

//If you have an Update request
bot.dialog('ServiceDesk.Update',[
	function(session,args,next){
		logThis("In ServiceDesk.Update dialog");
		var ticket=builder.EntityRecognizer.findEntity(args.intent.entities, 'ServiceDesk.TicketType');
		if(ticket){
			session.beginDialog('ServiceNow:/GetTicket',{'ticket_number':ticket,'type':'entity'});
		}
		else{
			session.beginDialog('ServiceDesk.Update/GetTicketNumber');			
		}
	},
	function(session,results){
		logThis("Hello");
		logThis(results);
		logThis(typeof results.response);
		if(typeof results.response!="undefined"){
			var msg=new builder.Message(session);
			var aCards=[];
			msg.attachmentLayout(builder.AttachmentLayout.carousel);
			for(var i=0;i<results.response.length;i++){
				var ticket=results.response[i];
				var card=new builder.HeroCard(session)
				                    .title(ticket.number+" "+ticket.short_description+" "+ticket.category)
				                    .subtitle(ticket.state);
				aCards[i]=card;
			}
			msg.attachments(aCards);
			session.send(msg);
			
		}
		else{
			session.send("Whoops! Something went wrong");
		
		}
	}
]).triggerAction({matches: 'ServiceDesk.Update'})
;

bot.dialog('ServiceDesk.Update/GetTicketNumber',[
	function(session,args,next){
		logThis("In the ServiceDesk.Update/GetTicketNumber dialog");
		builder.Prompts.confirm(session,"Do you have the ticket number handy? It should start with a INC, SRQ or CHG and be followed by a 7 digit number");		
	},
	function(session,results,next){
		logThis(results);
		if(results.response==true){
		   session.dialogData.ticketNumberAvailable=true;
		   builder.Prompts.text(session,"Great. Can you enter the ticket number?");
		}
		else{
		   session.dialogData.ticketNumberAvailable=false;
		   session.send("No Worries. I am getting your tickets off the service portal");
		   next();
		}
	},
	function(session,results,next){
		logThis(results);
		if(session.dialogData.ticketNumberAvailable==true){	
			session.beginDialog('ServiceNow:/GetTicket',{ticket_number:results.response,'type':'number'});
		}
		else{
			session.beginDialog('ServiceNow:/GetTickets');
		}
	},
	function(session,results){
		logThis(results);
		session.endDialogWithResult({response:results.Tickets});
	}
		
]);



bot.dialog('ServiceDesk.Greet',[
function(session,args,next){
	logThis("Debug:In the ServiceDesk.Greet dialog");
	session.endDialog(sGreeting);
	//session.send("OK. Calling the service desk...");
	//startProactiveDialog(endUser);
}
]).triggerAction({matches:'ServiceDesk.Greet'});

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
