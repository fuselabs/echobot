const util=require('util');

module.exports.logThis=function(results){
  if(process.env.DEBUG==1){
	  console.log("[CHEEP]:%s",util.inspect(results));
	}
}
