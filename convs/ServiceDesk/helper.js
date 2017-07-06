var builder=require('botbuilder');
var lib=new builder.Library('ServiceDesk');
const logger=require('../../lib/core/logger/helper.js');
var logThis=logger.logThis;


/*
Global definitions
*/

const sGreeting="Hi this is crashcart! How can I help you? You can type out your problem (I cannot print a file) or ask for an update on an existing ticket (what's the status of IN2030?) and I will respond";
/*
Dialog definitions
*/
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
			name:"MSBotFramework:/GetConfirm",
			parameters:{
				message:"Umm.. You don't seem to have any tickets. Do you want to open a new one?"
			}
		},
		success:{
			name:gjGetIncident.name,
			parameters:gjGetIncident.parameters
		},
		failure:{
			name:"",
			parameters:{message:null}
		}
	}		
};

var gjGetAndDisplayOneTicket={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"ServiceNow:/GetTicket",
			parameters:{
				message:null,
				persistResponse:true,
				persistVariable:'Tickets'
			}
		},
		success:{
			name:"ServiceNow:/MakeIncidents",
			parameters:{message:null}
		},
		failure:{
			name:gjNewTicketConv.name,
			parameters:gjNewTicketConv.parameters
		}
	}
};

var gjGetAndDisplayAllTickets={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"ServiceNow:/GetTickets",
			parameters:{
				message:null,
				persistResponse:true,
				persistVariable:'Tickets'
			}
		},
		success:{
			name:"ServiceNow:/MakeIncidents",
			parameters:{message:null}
		},
		failure:{
			name:gjNewTicketConv.name,
			parameters:gjNewTicketConv.parameters
		}
	}
};

var gjPromptUserForTicketNumber={
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
			 		name:gjGetAndDisplayOneTicket.name,
			 		parameters:gjGetAndDisplayOneTicket.parameters
	 	 		},
		 		failure:{
		 			name:"",
		 			parameters:{message:null}
		 		}
		 }
	},
	failure:{
		name:gjGetAndDisplayAllTickets.name,
		parameters:gjGetAndDisplayAllTickets.parameters
	}
}
};

var gjGetTicketStatusConv={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"MSBotFramework:/GetEntity",
			parameters:{
				persistResponse:true,
				persistVariable:'Ticket'
			}
		},
		success:{
			name:gjGetAndDisplayOneTicket.name,
			parameters:gjGetAndDisplayOneTicket.parameters
		},
		failure:{
			name:gjPromptUserForTicketNumber.name,
			parameters:gjPromptUserForTicketNumber.parameters
		}
	}
};

//If you have an Update request
var mapping=[
	{intentName: 'ServiceDesk.Update'}
];

var _funcs;
for(i=0;i<1;i++){
	_funcs=[
		function(session,args,next){
		logThis("In ServiceDesk:/GetUpdate dialog");
		//Save the global intent to the conversation data
		session.conversationData.intent=args.intent;
		session.beginDialog(gjGetTicketStatusConv.name,gjGetTicketStatusConv.parameters);
	},
	function(session,results){
		logThis("Ending ServiceDesk:/GetUpdate dialog");
		session.endConversation();
	}
	];	
		
	lib.dialog('/GetUpdate',_funcs).triggerAction({matches: 'ServiceDesk.Update'})
;
}

lib.dialog('/Greet',[
function(session,args,next){
	logThis("Debug:In the ServiceDesk.Greet dialog");
	logThis(session.message.address);
	session.endConversation(sGreeting);
	//session.send("OK. Calling the service desk...");
	//startProactiveDialog(endUser);
}
]).triggerAction({matches:'ServiceDesk.Greet'});

module.exports.createLibrary = function () {
    return lib.clone();
};
