var builder=require('botbuilder');
var lib=new builder.Library('MSBotFramework');
const util=require('util');
const debug=1;

function logThis(results){
	if(debug==1){
	console.log(util.inspect(results));
	}
}

lib.dialog('/GetConfirm',[
  function(session,args,next){
    console.log("In the MSBotFramework:/GetConfirm function");
    builder.Prompts.confirm(session,args.message);
  },
  function(session,result){
    console.log('Result returned from MSBotFramework:/GetConfirm function is in variable: response'
                +'Result is:'+result.response
                );
    session.endDialogWithResult({response:result.response,resumed:null,success:true});
  }
]);
                

lib.dialog('/GetText',[
  function(session,args,next){
    console.log("In the MSBotFramework:/GetText function");
    //console.log("The return variable is:"+args.returnVariable);
    session.dialogData.returnVariable=args.returnVariable;
    builder.Prompts.text(session,args.message);
  },
  function(session,result){
    var sResult='response.'+session.dialogData.returnVariable;
    console.log('Result returned from MSBotFramework:/GetText function is in variable: response'
                +'Result is:'+result.response
               );
    var map={}
    map['response']=result.response;
    map['resumed']=null;
    map['success']=true;
    session.endDialogWithResult(map);
  }
]);

lib.dialog('/CheckPrereqs',[
  function(session,args,next){
    console.log("In the MSBotFramework:/CheckPrereqs function");
    session.dialogData.args=args;
    session.beginDialog(args.check.name,args.check.parameters);
  },
  function(session,result){
    logThis(session.dialogData.args);
    if('persistResponse' in session.dialogData.args.check.parameters){
      if('persistVariable' in session.dialogData.args.check.parameters && 
	 session.dialogData.args.check.parameters['persistVariable']!=undefined){
        session.conversationData[session.dialogData.args.persistVariable]=result.response;
	logThis(session.dialogData.args);
      }
    }
    if(result.success==true){
      console.log("The Check function returned success");
      if(!session.dialogData.args.success.name){
        console.log("But no success function was defined, so returning with results");
        session.endDialogWithResult({response:result.response,success:true});
      }
      else{
        console.log("Invoking the success function");
        session.beginDialog(session.dialogData.args.success.name,session.dialogData.args.success.parameters);
      }
    }
    else{
      console.log("The Check function returned failure");
      if(!session.dialogData.args.failure.name){
        console.log("But no failure function was defined, so returning with results");
        session.endDialogWithResult({response:result.response,success:false});
      }
      else{
        console.log("Invoking the failure function");
        session.beginDialog(session.dialogData.args.failure.name,session.dialogData.args.failure.parameters);
      }
    }
  }
]);

module.exports.createLibrary = function () {
    return lib.clone();
};
