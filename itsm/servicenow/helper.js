var builder=require('botbuilder');
var serviceNow = require("service-now");

console.log(process.env.ITSM_ENDPOINT,process.env.ITSM_ACCOUNT,process.env.ITSM_PASSWORD);

var lib=new builder.Library('ServiceNow');
lib.dialog('/GetTickets',[
	function(session,args,next){
		console.log("In the ServiceNow:/GetTickets function");
		var uName=session.message.address.user.name;
		var Snow=new serviceNow(process.env.ITSM_ENDPOINT,process.env.ITSM_ACCOUNT,process.env.ITSM_PASSWORD);
		console.log(Snow);
		var tickets;
		var arName=session.message.address.user.name.split(' ');
		Snow.getRecords(
			{table:'incident',query:{'caller_id.first_name':'Abel',
					 'caller_id.last_name':'Tuter'
					}
			},
			function (err,data){
 				tickets=data;
				session.endDialogWithResult({'response':tickets,'success':true});
			}
		);
	}
]);

lib.dialog('/GetTicket',[
		function(session,args,next){
			/*
			TODO: 
			1. Need to rewrite this function so that the function evals the args and gets the number from the args.
			right now implicitly picks it up from session.conversationData
			Looks up a ticketnumber available in session.conversationData.Ticket
			Remember to endConversation at the handler function
			*/
			console.log("In the ServiceNow:/GetTicket function");
			console.log(args);
			console.log("Finding ticket:"+args.ticket_number);
			var uName=session.message.address.user.name;
			var Snow=new serviceNow(process.env.ITSM_ENDPOINT,process.env.ITSM_ACCOUNT,process.env.ITSM_PASSWORD);
			var tickets;
			
			var number=session.conversationData.Ticket;
			/*
			if(args.type=='entity'){
				number=args.ticket_number.entity;
			}
			else{
				number=args.ticket_number;
			}
			*/
			//var arName=session.message.address.user.name.split(' ');
			Snow.getRecords(
			{table:'incident',query:{'number':number}},
			function (err,data){
 				tickets=data;
				session.endDialogWithResult({response:tickets,success:true});
			}
		);
	}
]);

lib.dialog('/MakeIncidents',[
	function(session,args,next){
		/*
		Returns a set of hero cards at session.conversationData.TicketCards
		picks up the Tickets from session.conversationData.Tickets
		*/
		console.log("In the ServiceNow:/MakeIncidents function");
		var tickets;
		if('Tickets' in session.conversationData){
			tickets=session.conversationData.Tickets;
		}
		var msg=new builder.Message(session);
		var aCards=[];
		msg.attachmentLayout(builder.AttachmentLayout.carousel);
		for(var i=0;i<session.conversationData.Tickets.length;i++){
			var ticket=tickets[i];
			msg.addAttachment({
				contentType: "application/vnd.microsoft.card.adaptive",
				content: { 
					type: "AdaptiveCard",
					body:[{
						"type":"TextBlock",
						"text":"Adaptive Card",
						"size":"larger",
						"weight":"bolder"
					}],
					actions:[{
						"type": "Action.Http",
						"method": "POST",
						"url": "http://foo.com",
						"title": "Snooze"
					}]		  
				}
			});
			/*
			var card=new builder.HeroCard(session).title(ticket.number+" "+ticket.short_description+" "+ticket.category)
							      .subtitle(ticket.state);
			*/
			aCards[i]=card;					      
		}
		msg.attachments(aCards);
		session.send(msg);
		session.endDialogWithResult({response:msg,success:true});
	}	
]);
					     
lib.dialog('/CreateIncident',[
	function(session,args,next){
		console.log("In the ServiceNow:/CreateIncident function");
		var short_description=session.conversationData.IncidentDescription;
		var Snow=new serviceNow('https://wiprodemo4.service-now.com/','admin','LWP@2015');
		Snow.setTable('incident');
	}
		//Snow.
]);
		
module.exports.createLibrary = function () {
    return lib.clone();
};
