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
bot.library(require('./botframework/prompts/helper').createLibrary());
var luisModel = process.env.LUIS_ENDPOINT;
bot.recognizer(new builder.LuisRecognizer(luisModel));

var gjGetIncident={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"MSBotFramework:/GetText",
			parameters:{message:"Please describe your problem"}
		},
		success:{
			name:"",
			parameters:{message:null}
		},
		failure:{
			name:"",
			parameters:{message:null}
		}
	}
};
	
var gjNewTicketConv={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"MSBotFramework:/GetText",
			parameters:{
				message:"Umm.. You don't seem to have any tickets. Please describe your problem"
			}
		},
		success:{
			name:"MSBotFramework:/CheckPrereqs",
			parameters:{
				check:{
					name:"MSBotFramework:/GetText",
					parameters:{message:"Please describe your problem"}
				},
				success:{
					name:"",
					parameters:{message:null}
				},
				failure:{
					name:"",
					parameters:{message:null}
				}
			}
		},
		failure:{
			name:"",
			parameters:{message:null}
		}
	}		
};

var gjTicketConv={
name:"MSBotFramework:/CheckPrereqs",
parameters:{
	check:{ 
		name: "MSBotFramework:/GetConfirm",
	        parameters:{ message:
			    "Do you have the ticket number handy? It should start with a INC, SRQ or CHG and be followed by a 7 digit number"
			   }
	      },
	 success:{
		 name: "MSBotFramework:/CheckPrereqs",
		 parameters:{
		 		check:{ name:"MSBotFramework:/GetText",
			 		parameters:{ 
				 		message:"Great. Can you enter the ticket number?",
						persistResponse:true,
				 		persistVariable:'Ticket'
			 		}
		 		},
		 		success:{
			 		name:"ServiceNow:/GetTicket",
			 		parameters:{message:null} 
	 	 		},
		 		failure:{
		 			name:"",
		 			parameters:{message:null}
		 		}
		 }
	},
	failure:{
		name:"ServiceNow:/GetTickets",
		parameters:{message:null}
	}
}
};

//If you have an Update request
bot.dialog('ServiceDesk.Update',[
	function(session,args,next){
		logThis("In ServiceDesk.Update dialog");
		var ticket=builder.EntityRecognizer.findEntity(args.intent.entities, 'ServiceDesk.TicketType');
		if(ticket){
			session.conversationData.Ticket=ticket.entity;
			session.beginDialog('ServiceNow:/GetTicket',{'ticket_number':ticket.entity,'type':'entity'});
		}
		else{
			session.beginDialog(gjTicketConv.name,gjTicketConv.parameters);			
		}
	},
	function(session,results){
		logThis("Hello");
		//logThis(results);
		//logThis(typeof results.response);
		var Tickets;
		if(typeof results.Tickets!="undefined"){
			tickets=results.Tickets;
		}
		else if(typeof results.response!="undefined"){
			tickets=results.response;
		}
		if(tickets.length!=0){
			var msg=new builder.Message(session);
			var aCards=[];
			msg.attachmentLayout(builder.AttachmentLayout.carousel);
			for(var i=0;i<tickets.length;i++){
				var ticket=tickets[i];
				var card=new builder.HeroCard(session)
				                    .title(ticket.number+" "+ticket.short_description+" "+ticket.category)
				                    .subtitle(ticket.state);
				aCards[i]=card;
			}
			msg.attachments(aCards);
			session.send(msg);
			session.endConversation(); //need to call this to clear all conversation variables
			
		}
		else{
			session.beginDialog(gjNewTicketConv.name,gjNewTicketConv.parameters);
			session.endConversation();
		}
	}
]).triggerAction({matches: 'ServiceDesk.Update'})
;


bot.dialog('ServiceDesk.Greet',[
function(session,args,next){
	logThis("Debug:In the ServiceDesk.Greet dialog");
	logThis(session.message.address);
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
