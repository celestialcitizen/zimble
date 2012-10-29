
	var queryString = require('querystring');
	var http = require('http');
	var request = require('request');
	var fs = require('fs');
	var xml2js = require('xml2js');
	var json2xml = require('json2xml');
	var jsonxml = require('jsontoxml');
	var jstoxml = require('jstoxml');
	var async = require('async');

	var client_id = '930662704169-25secosrcggebfi0o2782enonuqfq1p8.apps.googleusercontent.com';
	var client_secret = 'R8Vu1AwHJfETR9iD19TifRF8';
	var redirect_uri = 'http://localhost:3001/wmrest/authorize';
	var proxyURL = 'http://cwybcproxy.us.dnb.com:8080';
	
	var requestDefault = request.defaults({'proxy':proxyURL});

   exports.getGoogleDocFile = function(requestObj,responseObj,callback)
   {
		 console.log('In getting google doc file...');
		 var file_name = 'WM_DEVICE_LIST';
		 var getGoogleDocFileURL = "https://www.googleapis.com/drive/v2/files?q=title%3D'" + file_name + "'andtrashed%3Dfalse&key=" + client_id;
		 var requestOptions = 
		 {  'uri': getGoogleDocFileURL,
			//'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'GET',
			'headers' :   {
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  }
		}; 
		
		 requestDefault(requestOptions,function (error, response, body) 
		 {
			  //console.log('In Callback After GET request for Google Spreadsheet');
			  //console.log(response.statusCode);
			  //console.log(response.headers);
			  
			  var googleResponse =  JSON.parse(response.body);
			  //console.log(googleResponse);
			  if(googleResponse.items.length && googleResponse.items.length > 0)
			  {
				//file exists
				//setting the file id for the user session
				requestObj.session.workSheetId = googleResponse.items[0].id;
				console.log('Read Spreadsheet Routine To Be Invoked For ' + requestObj.session.workSheetId);
				callback(null,true,requestObj,responseObj);
				//readSpreadSheet(requestObj,responseObj);
			  }	
			  else
			  {
				//create a file
				//createNewExcelSheet(requestObj,responseObj);
				console.log('Create Spreadsheet Routine To Be Invoked');
				callback(null,false,requestObj,responseObj);
			  }
			  //console.log(googleResponse.items[0].id);
			  
			  //readSpreadSheet(requestObj,responseObj);
			  //getWorkSheet(requestObj,responseObj);
			  //createWorkSheet(requestObj,responseObj);
		});
   }
   
   exports.createNewExcelSheet = function(flag,requestObj,responseObj,callback)
   {
   
		//flag will be set to true if the file already exists
		if( !eval(flag) )
		{
		   console.log('In Create New Excel Sheet');

		   fs.readFile('WMTEST_FILE.xls', function(err,data)
		   {
			  if(err) 
			  {
				console.error("Could not open file: %s", err);
				callback(err,null,null,null);
				//process.exit(1);
			  }
			  else
			  {
				 var googleDriveAPIURI = 'https://www.googleapis.com/upload/drive/v2/files?convert=true&uploadType=media&key=' + client_id;
				 var requestOptions = 
				 {  'uri': googleDriveAPIURI,
					//'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
					'method' : 'POST',
					'headers' :   {
						  'Content-Type': 'application/vnd.ms-excel',
						  'Authorization' : 'Bearer ' + requestObj.session.access_token
					  }
					  ,'body' : data
				}; 
				
				 requestDefault(requestOptions,function (error, response, body) 
				 {
					  //console.log('In Callback After Post Request For Excel Sheet');
					  console.log(response.statusCode);
					  //console.log(response.headers);
					  console.log(response.body);
					  
					  var responseBody = JSON.parse(response.body);
					  var workSheetId = responseBody.id;
					  console.log(workSheetId);
					  requestObj.session.workSheetId = workSheetId;
					  //update worksheet title
					  //updateFileName(requestObj,responseObj,readSpreadSheet);
					 callback(null,true,requestObj,responseObj);
					  
					  
				});
			   }
			});
		}
		else
		{
			callback(null,false,requestObj,responseObj);
		}
   }
   
   exports.updateFileName = function(flag,requestObj,responseObj,callback)
   {
		//if flag is set to true
		//file name needs to be updated
		if(eval(flag))
		{
			console.log('In updateFileName');
			var updateURI = 'https://www.googleapis.com/drive/v2/files/' + requestObj.session.workSheetId + '?key=' + client_id;
			var updateData = {'title':'WM_DEVICE_LIST'};
			 var requestOptions = 
			 {  'uri': updateURI,
				//'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
				'method' : 'PUT',
				'headers' :   {
					  'Content-Length' : updateData.length,
					  'Content-Type': 'application/json',
					  'Authorization' : 'Bearer ' + requestObj.session.access_token
				  }
				  ,'body' : JSON.stringify(updateData)
			}; 
			
			 requestDefault(requestOptions,function (error, response, body) 
			 {
				  console.log('In Callback After Post Request For Excel Sheet');
				  callback(null,requestObj,responseObj);
				  //console.log(response.statusCode);
				  //console.log(response.headers);
				  //console.log(response.body);
				  
			});
		}
		else
		{
			callback(null,requestObj,responseObj);
		}
   }
   
   exports.readSpreadSheet = function(requestObj,responseObj,callback)
	{
		console.log('In readSpreadSheet');
		var xmlListFeed = 'https://spreadsheets.google.com/feeds/list/' + requestObj.session.workSheetId +  '/1/private/full';
		var xmlCellFeed = 'https://spreadsheets.google.com/feeds/cells/' + requestObj.session.workSheetId +  '/1/private/full';
		
		var requestOptions = 
		 {  'uri': xmlListFeed,
			//'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'GET',
			'headers' :   {
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  }
		}; 

		 requestDefault(requestOptions,function (error, response, body) 
		 {
			  //console.log('In Callback After GET request for Google Spreadsheet');
			  //console.log(response.statusCode);
			  //console.log(response.headers);
			 //console.log(response.body);
			  var feedDataXML = response.body;
			  var feedParser = new xml2js.Parser();
			  feedParser.parseString(feedDataXML,function(err,result)
			  {
				//console.log(result);
				//console.log(JSON.stringify(result));
				var feedDataJSON = JSON.parse(JSON.stringify(result));
				//var feedDataJSON = JSON.stringify(result);
				//console.log(feedDataJSON);
				//console.log(feedDataJSON['feed'].entry[0].content[0]['_']);
				var deviceArray = {};
				
				var deviceList = feedDataJSON['feed'].entry;
				//console.log(JSON.stringify(deviceList));
				
				if(deviceList)
				{
					for(var devCount = 0; devCount < deviceList.length; devCount++)
					{
						
						var tmpDevObj =  {};
						tmpDevObj['devicename'] = deviceList[devCount]['gsx:devicename'][0];
						tmpDevObj['modeldetails'] = deviceList[devCount]['gsx:modeldetails'][0];
						tmpDevObj['purchasedate'] = deviceList[devCount]['gsx:purchasedate'][0];
						tmpDevObj['coverageperiod'] = deviceList[devCount]['gsx:coverageperiod'][0];
						tmpDevObj['expirydate'] = deviceList[devCount]['gsx:expirydate'][0];
						tmpDevObj['emailalert'] = deviceList[devCount]['gsx:emailalert'][0];
						if(deviceList[devCount]['link'][1]["$"]["href"])
						{
							tmpDevObj['updateurl'] = deviceList[devCount]['link'][1]["$"]["href"]; // the spreadhseet row id for update 
							//console.log('Update URL is:' + deviceList[devCount]['link'][1]["$"]["href"]);
						}
						deviceArray['dev_' + devCount] = tmpDevObj; 
						//console.log(tmpDevObj);
						
						
					}
				}
				
				//responseObj.json(deviceArray);
				callback(null,responseObj,deviceArray);
				
				//console.log(JSON.stringify(result));
			  })
			  //var googleResponse =  JSON.parse(response.body);
			  //console.log(googleResponse.items[0].id);
			  //requestObj.session.workSheetId = googleResponse.items[0].id;
			  //getWorkSheet(requestObj,responseObj);
			  //createWorkSheet(requestObj,responseObj);
		});
		
	}