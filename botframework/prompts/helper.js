var builder=require('botbuilder');

var lib=new builder.Library('MSBotFramework');

lib.dialog('/GetConfirm',[
  function(session,args,next){
    console.log("In the MSBotFramework:/GetConfirm function");
    builder.Prompts.confirm(session,args.message);
  },
  function(session,result){
    console.log('Result returned from MSBotFramework:/GetConfirm function is in variable: response'
                +'Result is:'+result.response
                );
    session.endDialogWithResult({response:result.response,resumed:null});
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
    if(result.response==true){
      if(!session.dialogData.args.success.name){
        session.endDialogWithResult({response:result.response});
      }
      else{      
        session.beginDialog(session.dialogData.args.success.name,session.dialogData.args.success.parameters);
      }
    }
    else{
      if(!session.dialogData.args.failure.name){
        session.endDialogWithResult({response:result.response});
      }
      else{
        session.beginDialogData(session.dialogData.args.failure.name,session.dialogData.failure.parameters);
      }
    }
  }
]);

module.exports.createLibrary = function () {
    return lib.clone();
};
