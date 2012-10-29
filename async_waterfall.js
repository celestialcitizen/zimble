var async = require('async');

function one( callback)
{
	console.log('In function one');
	//console.log('param1 is: ' + param1);
	resultOne = 23;
	callback(null,resultOne);
}

function two(param1,callback)
{
	console.log('In function two');
	console.log('param1 is: ' + param1);
	callback(null,45,78);
	
	//resultOne = 23;
	//return resultOne;
}

function callBackFunction(err,result1,result2)
{
	console.log('In callBackFunction ' + result1 + ' ' + result2);
}

async.waterfall([one,two],function(err,result1,result2)
{
	//console.log('In main callBackFunction');
	console.log('In callBackFunction ' + result1 + ' ' + result2);
});