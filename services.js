//service layer for warrany manager
	var queryString = require('querystring');
	var http = require('http');
	var request = require('request');
	var fs = require('fs');
	var xml2js = require('xml2js');
	var json2xml = require('json2xml');
	var jsonxml = require('jsontoxml');
	var jstoxml = require('jstoxml');
	var async = require('async');
	var gserv = require('./google_services');
	var moment = require('./moment.min');
	
/*
 method called after google authorization is complete
*/
	var client_id = '930662704169-25secosrcggebfi0o2782enonuqfq1p8.apps.googleusercontent.com';
	var client_secret = 'R8Vu1AwHJfETR9iD19TifRF8';
	var redirect_uri = 'http://localhost:3001/wmrest/authorize';

	/*
		Performs OAuth 2.0 With Google For Authentication
	*/
	exports.authorize = function(req,res)
	{
		console.log('in authorize');
		//console.log(req.query);
		//console.log(req);
		
		if(req.query.error)
		{
			var error = req.query.error;
			console.log('Error While Authorizing With Google');
			console.log('Erro Message Is: ' + error);
		}
		else if(req.query.code)
		{
			//google authorization is succesful
			req.session.code = req.query.code;
			console.log('Exchanging Authorization Code For Access Token');
			var authorization_code = req.query.code;
			/*var client_id = '930662704169-25secosrcggebfi0o2782enonuqfq1p8.apps.googleusercontent.com';
			var client_secret = 'R8Vu1AwHJfETR9iD19TifRF8';
			var redirect_uri = 'http://localhost:3001/wmrest/authorize';*/
			
			//make a post request to Google to obtain access token
			 var postData = 
			 {
				'code' : authorization_code,
				'client_id' : client_id,
				'client_secret' : client_secret,
				'redirect_uri' : redirect_uri,
				'grant_type' : 'authorization_code',
				//'response_type' : 'code',
				//'scope' : 'https://www.googleapis.com/auth/userinfo.email'
			 }
			 
			 
			 //postRequest(postOptions,JSON.stringify(postData),res);
			 var googlePostURI = 'https://accounts.google.com/o/oauth2/token'
			 var requestOptions = 
			 {  'uri': googlePostURI,
				'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
				'method' : 'POST',
				'headers' :   {
					  'Content-Type': 'application/x-www-form-urlencoded'
				  },
				'form' : postData 
			}; 
			
			 request(requestOptions,function (error, response, body) 
			 {
				  if(response.statusCode == 200)
				  {
					var accessTokenObj =  JSON.parse(body);
					//console.log(accessTokenObj);
					var access_token = accessTokenObj.access_token;
					req.session.access_token = access_token;
					//createNewExcelSheet(req,res);
					//getGoogleDocFile(req,res);
					getUserInfo(access_token,res,req);
					
				  } else {
					console.log('error: '+ response.statusCode)
					console.log(body);
					res.send(body);
				  }
			});
			
		}
		
	}

     //obtain user email
	function getUserInfo(access_token,responseObj,requestObj)
	{
		var googleGetUserInfoURI = 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + access_token;
		 var requestOptions = 
		 {  'uri': googleGetUserInfoURI,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'GET'
			//'headers' :   {
			//	  'Content-Type': 'application/x-www-form-urlencoded'
			//  },
			//'form' : postData 
		}; 
		
		request(requestOptions,function (error, response, body) 
		 {
			
			if(response.statusCode == 200)
			  {
				
				var userInfoObj =  JSON.parse(body);
				//setting the user name in the session object
				requestObj.session.username = userInfoObj.email;
				responseObj.redirect('/');
				//responseObj.render('index_2',{'email': userInfoObj.email });
				
			  } else {
				console.log('error: '+ response.statusCode)
				console.log(body);
				res.send(body);
			  }
		});
	}

    /*
		loads data from the excel sheet
	*/
	exports.loadDeviceData = function(req,res)
	{
		//get google Zimble calendar for user
		//if it does not exist then create one
		async.waterfall(
		[
			function(callback)
			{
				gserv.getGoogleCalendar(req,res,callback);
			},
			function(flag,req,res,callback)
			{
				gserv.createGoogleCalendar(flag,req,res,callback);
			}
		
		],function(err)
		{
			if(err)
			{
				console.log('Error while setting up Google Calendar Options : Error is : ' + err);
			}
		});
		
		//check if the user google drive account has a google spreadsheet by name
		//WM_DEVICE_LIST.xls
		//if such a file does not exist create a file
		//once the file is created get data from the file
		//getGoogleDocFile(req,res);
		async.waterfall(
		[
			function(callback)
			{
				gserv.getGoogleDocFile(req,res,callback);
			},
			function(flag,req,res,callback)
			{
				gserv.createNewExcelSheet(flag,req,res,callback);
			},
			function(flag,req,res,callback)
			{
				gserv.updateFileName(flag,req,res,callback);
			},
			function(flag,req,res,callback)
			{
				gserv.readSpreadSheet(flag,req,res,callback);
			},
		
		],function(err,res,resultXML)
		{
			//console.log('In main callBackFunction');
			//console.log('In callBackFunction ' + result1 + ' ' + result2);
			if(err)
			{
				console.log('Error getting / reading spreadsheet : ' + err);
			}
			else
			{
				devXmlToJSON(resultXML,res);
				//res.json(resultArray);
			}
		});
		
		
	}
	
	
	
	
	/*
		Perform Create,Update,Delete operations for each row in the google spreadsheet
	*/
	exports.atomic_save = function(req,res)
    {
		//console.log(req.session.username);
		console.log('Device Save Data: ' + JSON.stringify(req.body));
		var device = req.body;
		var userinfo = device['userinfo'];
		var deviceList = new Array();
		
		var tmpObj = {};
		delete device['userinfo'];
		
	
	   tmpObj['gsx:devicename'] = device['devicename'];
	   //tmpObj['gsx:modeldetails'] = device['modeldetails'];
	   tmpObj['gsx:purchasedate'] = device['purchasedate'];
	   //tmpObj['gsx:coverageperiod'] = device['coverageperiod'];
	   tmpObj['gsx:expirydate'] = device['expirydate'];
	   tmpObj['gsx:notes'] = device['notes'];
	   tmpObj['gsx:emailalert'] = device['emailalert'];
	   //tmpObj['gsx:eventid'] = device['eventid'];
	   tmpObj['workSheetId'] = req.session.workSheetId;
	   tmpObj['access_token'] = req.session.access_token;
	   if(device['deleteurl'])
		tmpObj['deleteurl'] = device['deleteurl'];  
	   else if(device['updateurl'])
		tmpObj['updateurl'] = device['updateurl'];   
		
		deviceList[0] = tmpObj;
		
	
		
		async.waterfall(
		[
			function(callback)
			{				
				//update event and pass on eventId to the next function in the waterfall
				//existing device is getting updated / deleted
				//update / delete google event
				var updateMethod = '';
				var eventData = {};
				var eventId = (device['eventid'] && device['eventid'] != 'NA') ? device['eventid'] : '';
				//console.log(JSON.stringify(device));
				
				//if(device['updateurl'] || device['deleteurl'])
				//{
					
					//if( (device['updateurl'] && device['emailalert'] == 'No') ||  device['deleteurl'])
					if( (device['eventid'] && device['emailalert'] == 'No') ||  device['deleteurl'])
					{
						if(device['eventid'] && device['eventid'] != 'NA' ) // if an event exists
						{
							updateMethod = 'DELETE';
						}
					}
					//else if(device['updateurl'] && device['emailalert'] == 'Yes' && device['eventid'])
					else if(device['emailalert'] == 'Yes' && device['eventid'] && device['eventid'] != 'NA' )
					{
						updateMethod = 'PUT';
						//console.log('updateMethod is resolved to : ' + updateMethod);
					}
					else if( device['emailalert'] === 'Yes' )
					{
						updateMethod = 'POST';
						//console.log('updateMethod is resolved to : ' + updateMethod);
					}
					
					//console.log('updateMethod is resolved to : ' + updateMethod);
					if(updateMethod == 'PUT' || updateMethod == 'POST')
					{
						//if device data is getting updated and the event date changes then we have to use the PUT method
						if( ( updateMethod == 'PUT' && eval(device['eventFlag']) ) || updateMethod == 'POST')
						{
							var eventDate = moment(device['expirydate'],'DD/MM/YYYY');
							eventData['end'] = {};
							eventData['end']['date'] = eventDate.format('YYYY-MM-DD');
							eventData['start'] = {};
							eventData['start']['date'] = eventDate.format('YYYY-MM-DD');
						}
						else
						{
							updateMethod = 'PATCH';
						}
						eventData['summary'] = 'Zimble Alert For ' + device['devicename'];
						eventData['description'] =  'Coverage/Warranty/Guarantee/Service Period For '  + device['devicename'] +  ' '  + ' will end on ' +  device['expirydate'];
					}
					
					gserv.updateGoogleEvent(req,res,eventData,updateMethod,eventId,callback);
				//}
				
			},
			function(req,res,eventid,callback)
			{
				console.log('Async waterfall updating excel sheet');
				console.log('Event ID is : ' + eventid);
				//gserv.createGoogleCalendar(flag,req,res,callback);
				//update device/service and also update the eventid if necessary
				var updateMethod = '';
				var updateURL = '';
				var rowData = {};
				
				if(device['updateurl'])
				{
					updateMethod = 'PUT';
					updateURL = device['updateurl'];
				}
				else if(device['deleteurl'])
				{				
					updateMethod = 'DELETE';
					updateURL = device['deleteurl'];
				}
				else
				{
					updateMethod = 'POST';
					updateURL = 'https://spreadsheets.google.com/feeds/list/' + req.session.workSheetId +  '/1/private/full';
				}
				
				if(updateMethod == 'POST' || updateMethod == 'PUT')
				{
				   var tmpDeviceObj = {};	
				   tmpDeviceObj['gsx:devicename'] = device['devicename'];
				   //tmpDeviceObj['gsx:modeldetails'] = device['modeldetails'];
				   tmpDeviceObj['gsx:purchasedate'] = device['purchasedate'];
				   //tmpDeviceObj['gsx:coverageperiod'] = device['coverageperiod'];
				   tmpDeviceObj['gsx:expirydate'] = device['expirydate'];
				   
				   if(device['notes'])
				   {
						tmpDeviceObj['gsx:notes'] = device['notes'];
				   }
				   else
				   {
						tmpDeviceObj['gsx:notes'] = 'NA';
				   }
				   
				   
				   tmpDeviceObj['gsx:emailalert'] = device['emailalert'];
				   
				   
				   if(eventid)
						tmpDeviceObj['gsx:eventid'] = eventid;
				   else
						tmpDeviceObj['gsx:eventid'] = 'NA';
				   
				   //console.log(tmpDeviceObj);
				   
				    var jsonFeedObj = 
					{
						 _name: 'entry',
						  _content: tmpDeviceObj,
						  _attrs: {
							"xmlns": "http://www.w3.org/2005/Atom",
							"xmlns:openSearch": "http://a9.com/-/spec/opensearchrss/1.0/",
							"xmlns:gsx": "http://schemas.google.com/spreadsheets/2006/extended",
						  }
					}
					
					rowData = jstoxml.toXML(jsonFeedObj);
					//console.log(rowData);
				}
				//console.log('updateMethod is resolved to : ' + updateMethod);
				gserv.updateRow(req,res,rowData,updateMethod,updateURL,callback);
			}
		
		],function(err,updatedData)
		{
			var statusObj = {};
			if(err)
			{
				console.log('Error while updating Device / Service / Event : Error is : ' + err);
				console.log('Async CallBack Error:' + err);
				statusObj['status'] = 'error';
				res.json(statusObj);
			}
			else
			{
				console.log('Async Row Update Success');
				console.log('Async CallBack Success:');
				//statusObj['status'] = 'success';
				if(updatedData)
					devXmlToJSON(updatedData,res);
				else
				{
					statusObj['status'] = 'success';
					res.json(statusObj);
				}
			}
			//res.json(statusObj);
			
			
			
		});
		
		console.log('Async Row Update Started');
		
		
	}
   
  
   
   function updateSpreadSheetRow(deviceObj,updateCB)
   {
   
		var updateurl = '';
		var updateMethod = 'POST';
		var xmlListFeed = 'https://spreadsheets.google.com/feeds/list/' + deviceObj['workSheetId'] +  '/1/private/full';
		var userAccessToken = deviceObj['access_token'];
		delete deviceObj['workSheetId'];
		delete deviceObj['access_token'];
		
		if(deviceObj['deleteurl'])
		{
			xmlListFeed = deviceObj['deleteurl'];
			delete deviceObj['deleteurl'];
			delete deviceObj['updateurl'];
			updateMethod = 'DELETE';
		}
		else if(deviceObj['updateurl'])
		{
			xmlListFeed = deviceObj['updateurl'];
			delete deviceObj['updateurl'];
			updateMethod = 'PUT';
		}
		
		var jsonFeedObj = 
		{
			 _name: 'entry',
			  _content: deviceObj,
			  _attrs: {
				"xmlns": "http://www.w3.org/2005/Atom",
				"xmlns:openSearch": "http://a9.com/-/spec/opensearchrss/1.0/",
				"xmlns:gsx": "http://schemas.google.com/spreadsheets/2006/extended",
			  }
		}
		
		var xmlFeedObj = jstoxml.toXML(jsonFeedObj);

		var requestOptions = 
		 {  'uri': xmlListFeed,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : updateMethod,
			'headers' :   {
				  'Authorization' : 'Bearer ' + userAccessToken,
				  'Content-Type': 'application/atom+xml'
			  },
			'body' : xmlFeedObj
		}; 
		
		//console.log(requestOptions);
		//use async here as well to make updates to the zimble calendar if any
		if ( updateMethod == 'POST' || updateMethod == 'PUT')
		{
			 //console.log(xmlFeedObj);
			 //console.log(deviceObj);
			 request(requestOptions,function (error, response, body) 
			 {
				  //console.log('In Callback After POST feed to Google Spreadsheet');
				  //console.log(response.statusCode);
				  //console.log(response.headers);
				  //console.log(response.body);
				  updateCB();
			});
		}
		else if( updateMethod == 'DELETE' )
		{
			//use async here as well to delete events from zimble calendar if any
			console.log('In delete method');
			
			var requestGETOptions = 
			 {  'uri': xmlListFeed,
				'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
				'method' : updateMethod,
				'headers' :   {
					  'Authorization' : 'Bearer ' + userAccessToken,
					  'Content-Type': 'application/atom+xml',
					  'If-Match' : '*'
				  }
			}; 
			
			 request(requestGETOptions,function (error, response, body) 
			 {
				 updateCB();
			});
		}
		
   }
   
   function updateCB(err)
   {
   };
   
   
   /*
		Returns the URL for the Spreadhseet
	*/
	exports.getFileURL = function(req,res)
	{
		console.log('In getFileURL');
		var baseURL = 'https://docs.google.com/spreadsheet/ccc?key=';
		var urlObj = {};

		if(req.session.workSheetId)
		{
			urlObj.url = baseURL + req.session.workSheetId;
		}
		else
		{
			urlObj.error = 'URL Could Not Be Fetched';
		}
		
		res.json(urlObj);
		
	}

	/*
		Utility to convert XML feed from spreadsheet into JSON for 
		device xml
	*/
	function devXmlToJSON(feedDataXML,responseObj)
	{
		//console.log('XML Feed Is : ' + feedDataXML);
		var feedParser = new xml2js.Parser();
		var deviceArray = {};
		  feedParser.parseString(feedDataXML,function(err,result)
		  {
			//console.log(result);
			//console.log(JSON.stringify(result));
			var feedDataJSON = JSON.parse(JSON.stringify(result));
			//var feedDataJSON = JSON.stringify(result);
			//console.log(feedDataJSON);
			//console.log(feedDataJSON['feed'].entry[0].content[0]['_']);
			
			var deviceList = '';
			
			
			if(feedDataJSON['feed'])
			{
				deviceList = feedDataJSON['feed'].entry;
				if(deviceList)
				{
					for(var devCount = 0; devCount < deviceList.length; devCount++)
					{
						
						var tmpDevObj =  {};
						tmpDevObj['devicename'] = deviceList[devCount]['gsx:devicename'][0];
						//tmpDevObj['modeldetails'] = deviceList[devCount]['gsx:modeldetails'][0];
						tmpDevObj['purchasedate'] = deviceList[devCount]['gsx:purchasedate'][0];
						//tmpDevObj['coverageperiod'] = deviceList[devCount]['gsx:coverageperiod'][0];
						tmpDevObj['expirydate'] = deviceList[devCount]['gsx:expirydate'][0];
						tmpDevObj['notes'] = deviceList[devCount]['gsx:notes'][0];
						tmpDevObj['emailalert'] = deviceList[devCount]['gsx:emailalert'][0];
						tmpDevObj['eventid'] = deviceList[devCount]['gsx:eventid'][0];
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
				
			}
			else
			{
				deviceList = feedDataJSON.entry;
				if(deviceList)
				{
					
						var tmpDevObj =  {};
						tmpDevObj['devicename'] = deviceList['gsx:devicename'][0];
						//tmpDevObj['modeldetails'] = deviceList['gsx:modeldetails'][0];
						tmpDevObj['purchasedate'] = deviceList['gsx:purchasedate'][0];
						//tmpDevObj['coverageperiod'] = deviceList['gsx:coverageperiod'][0];
						tmpDevObj['expirydate'] = deviceList['gsx:expirydate'][0];
						tmpDevObj['notes'] = deviceList['gsx:notes'][0];
						tmpDevObj['emailalert'] = deviceList['gsx:emailalert'][0];
						tmpDevObj['eventid'] = deviceList['gsx:eventid'][0];
						if(deviceList['link'][1]["$"]["href"])
						{
							tmpDevObj['updateurl'] = deviceList['link'][1]["$"]["href"]; // the spreadhseet row id for update 
							//console.log('Update URL is:' + deviceList['link'][1]["$"]["href"]);
						}
						deviceArray['curr_obj'] = tmpDevObj; 
						console.log('curr_obj is ' + JSON.stringify(deviceArray['curr_obj']));
						
				}
			}
			
			
			
			
			//console.log('Device Array Is: ' + JSON.stringify(deviceArray));
			responseObj.json(deviceArray);
			//callback(null,responseObj,deviceArray);
			
			
			
		  })
	}