var builder=require('botbuilder');

var lib=new builder.Library('MSBotFramework');

lib.dialog('/GetText',[
  function(session,args,next){
    console.log("In the MSBotFramework:/GetText function");
    console.log("The return variable is:"+args.returnVariable);
    session.dialogData.returnVariable=args.returnVariable;
    builder.Prompts.text(session,args.message);
  },
  function(session,result){
    var sResult='response.'+session.dialogData.returnVariable;
    console.log('Result returned from MSBotFramework:/GetText function is in variable:'+sResult
                +'Result is:'+result.response
               );
    var map={}
    map['response']=result.response;
    map['resumed']=null;
    session.endDialogWithResult(map);
  }
]);

module.exports.createLibrary = function () {
    return lib.clone();
};
