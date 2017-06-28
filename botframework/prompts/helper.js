var builder=require('botbuilder');

var lib=new builder.Library('MSBotFramework');

lib.dialog('/GetText',[
  function(session,args,next){
    console.log("In the MSBotFramework:/GetText function");
    console.log("The return variable is:"+args.returnVariable);
    session.dialogData.returnVariable=args.returnVariable;
    builder.prompt.Text(session,args.message);
  },
  function(session,results){
    session.endDialogWithResults({
      'response.'+session.dialogData.returnVariable:results.response,
      'resumed':null
    });
  }
]);

module.exports.createLibrary = function () {
    return lib.clone();
};
