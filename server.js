var restify = require('restify');
var builder = require('botbuilder');
var serviceNow = require("service-now");
const util=require('util');
//const debuglog=util.debuglog('CRASHCART_DEBUG:');
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
var luisModel = process.env.LUIS_ENDPOINT;
bot.recognizer(new builder.LuisRecognizer(luisModel));

//If you have an Update request
bot.dialog('ServiceDesk.Update',[
	function(session,args,next){
		logThis("In ServiceDesk.Update dialog");
		var ticket=builder.EntityRecognizer.findEntity(args.intent.entities, 'ServiceDesk.TicketType');
		if(ticket){
			session.send("Finding the status of ticket :"+ticket.entity);
		}
		else{
			session.userData.TicketNumber=undefined;
			session.userData.Tickets=undefined;
			next();
						
		}
	},
	function(session,results,next){
		session.dialogData.TicketNumberAvailable=false;
		session.beginDialog('ServiceDesk.Update/GetTicketNumber');
	},
	function(session,results){
		logThis(results);
		if(typeof results.response.TicketNumber==="undefined"){
			var msg=new builder.Message(session);
			msg.attachmentLayout(builder.AttachmentLayout.carousel);
			for(ticket in results.response.Tickets){
				logthis(ticket)
				msg.addAttachment({
					contentType: "application/vnd.microsoft.card.adaptive",
					content: {
            					type: "AdaptiveCard",
						body:[
							{"type":"TextBlock",
							"text": ticket.number+" "+ticket.short_description,
                        				"size": "large",
                        				"weight": "bolder"
                    					},
                    					{"type": "TextBlock",
							 "size":"large",
							 "weight":"bolder",
                        				 "text": ticket.state
                    					},
							{"type": "TextBlock",
                        				 "text": ticket.category
                    					},
						],
						"actions":[
							{
							"type":"Action.Http",
							"method":"GET",
							"url":"https://wiprodemo4.service-now.com/sp",
							"title":"View ticket"
							}
						]
					}
				});
			}
			session.send(msg);
		}
		else{
			session.send("Finding the status of the ticket :"+results.response.TicketNumber);
		
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
		   session.beginDialog('ServiceDesk.Update/GetTickets');
		}
	},
	function(session,results){
		logThis(results);
		if(session.dialogData.ticketNumberAvailable==true){	
			session.userData.TicketNumber=results.response;
			//session.dialogData.TicketNumberAvailable=true;
		}
		else{
			session.userData.Tickets=results.response;
			
		}
		session.endDialogWithResult({response:session.userData});

	}
		
]);

bot.dialog('ServiceDesk.Update/GetTickets',[
	function(session,args,next){
		logThis("In the ServiceDesk.Update/GetTickets dialog");
		//console.log(session.message.address);
		//session.send("In the getTickets function");
		var uName=session.message.address.user.name;
		var Snow=new serviceNow('https://wiprodemo4.service-now.com/','admin','LWP@2015');
		var tickets;
		logThis(session.message.address);
		var arName=session.message.address.user.name.split(' ');
		Snow.getRecords(
			{table:'incident',query:{'caller_id.first_name':'Abel',
					 'caller_id.last_name':'Tuter'
					}
			},
			(err,data)=>{
 				tickets=data;
				session.endDialogWithResult({response:tickets});
			}
		);
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
