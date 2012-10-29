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
				console.log(body);
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


	exports.loadDeviceData = function(req,res)
	{
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
		
		],function(err,res,resultArray)
		{
			//console.log('In main callBackFunction');
			//console.log('In callBackFunction ' + result1 + ' ' + result2);
			res.json(resultArray);
		});
	}
	
	
	function postRequest(requestOptions,postData,responseObj) 
	{
		  console.log('Making the Post Request');
		  console.log('Post Data is:' + postData);
		  // Set up the request
		  var post_req = http.request(requestOptions, function(res) 
		  {
			   console.log('In Post Callback');
			   console.log('Response is ' + res);
			  var data = '';
			  //res.setEncoding('utf8');
			  res.on('data', function (chunk) {
				 console.log('Response: ' + chunk);
				 data += chunk;	
				  //expressResponse.json(chunk);
			  });
			  res.on('end',function()
			  {
				if(data)
				{
					console.log('Respons Data is:' +  data);
					/*try
					{
						var jsonResult  = JSON.parse(data);
						//expressResponse.json(jsonResult.topics);
						responseObj.json(jsonResult);
					}
					catch(err)
					{
						console.log(err);
						var errMessage = {"message":"Error"};
						//console.log("Contacting Node.js RSS Services");
						responseObj.json(errMessage);
					}*/
				}
			  });
		  });

		  // post the data
		  post_req.write(postData);
		  post_req.end();

	};
	
    exports.save_device = function(req,res)
    {
		//console.log(req.session.username);

		var device_array = req.body;
		var deviceList = new Array();
		var deviceCount = 0;
		var userinfo = device_array['userinfo'];
		delete device_array['userinfo'];
		
		for (var key in device_array) 
		{
		   var obj = device_array[key];
		   var tmpObj = {};
		   tmpObj['gsx:devicename'] = obj['devicename'];
		   tmpObj['gsx:modeldetails'] = obj['modeldetails'];
		   tmpObj['gsx:purchasedate'] = obj['purchasedate'];
		   tmpObj['gsx:coverageperiod'] = obj['coverageperiod'];
		   tmpObj['gsx:expirydate'] = obj['expirydate'];
		   tmpObj['gsx:emailalert'] = obj['emailalert'];
		   tmpObj['workSheetId'] = req.session.workSheetId;
		   tmpObj['access_token'] = req.session.access_token;
		   if(obj['updateurl'])
			tmpObj['updateurl'] = obj['updateurl'];
			
		   deviceList[deviceCount] = tmpObj;
		   deviceCount++;
		}
		
		async.forEach(deviceList, updateSpreadSheetRow, function(err)
		{
			var statusObj = {};
			if(err)
			{
				console.log('Async CallBack Error:' + err);
				statusObj['status'] = 'error';
			}
			else
			{
				console.log('Async CallBack Success:');
				statusObj['status'] = 'success';
			}
			
			res.json(statusObj);
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
		
		if(deviceObj['updateurl'])
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
		
		 request(requestOptions,function (error, response, body) 
		 {
			  //console.log('In Callback After POST feed to Google Spreadsheet');
			 // console.log(response.statusCode);
			  //console.log(response.headers);
			  //console.log(response.body);
			  updateCB();
		});
		
   }
   
   function updateCB(err)
   {
   };
   
   function createNewExcelSheet(requestObj,responseObj)
   {
		console.log('In Create New Excel Sheet');

		   fs.readFile('WMTEST_FILE.xls', function(err,data)
		   {
			  if(err) 
			  {
				console.error("Could not open file: %s", err);
				process.exit(1);
			  }
			  else
			  {
				 var googleDriveAPIURI = 'https://www.googleapis.com/upload/drive/v2/files?convert=true&uploadType=media&key=' + client_id;
				 var requestOptions = 
				 {  'uri': googleDriveAPIURI,
					'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
					'method' : 'POST',
					'headers' :   {
						  'Content-Type': 'application/vnd.ms-excel',
						  'Authorization' : 'Bearer ' + requestObj.session.access_token
					  }
					  ,'body' : data
				}; 
				
				 request(requestOptions,function (error, response, body) 
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
					  updateFileName(requestObj,responseObj,readSpreadSheet);
					  
					  
				});
			   }
			});
		
		
   }
   
   function updateFileName(requestObj,responseObj,afterUpdate)
   {
		console.log('In updateFileName');
		var updateURI = 'https://www.googleapis.com/drive/v2/files/' + requestObj.session.workSheetId + '?key=' + client_id;
		var updateData = {'title':'WM_DEVICE_LIST'};
		 var requestOptions = 
		 {  'uri': updateURI,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'PUT',
			'headers' :   {
				  'Content-Length' : updateData.length,
				  'Content-Type': 'application/json',
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  }
			  ,'body' : JSON.stringify(updateData)
		}; 
		
		 request(requestOptions,function (error, response, body) 
		 {
			  console.log('In Callback After Post Request For Excel Sheet');
			  console.log(response.statusCode);
			  console.log(response.headers);
			  console.log(response.body);
			  afterUpdate(requestObj,responseObj);
		});
   }
   
   function getGoogleDocFile(requestObj,responseObj)
   {
		 console.log('In getting google doc file...');
		 var getGoogleDocFileURL = "https://www.googleapis.com/drive/v2/files?q=title%3D'WM_DEVICE_LIST'&key=" + client_id;
		 var requestOptions = 
		 {  'uri': getGoogleDocFileURL,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'GET',
			'headers' :   {
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  }
		}; 
		
		 request(requestOptions,function (error, response, body) 
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
				readSpreadSheet(requestObj,responseObj);
			  }	
			  else
			  {
				//create a file
				createNewExcelSheet(requestObj,responseObj);
			  }
			  //console.log(googleResponse.items[0].id);
			  
			  //readSpreadSheet(requestObj,responseObj);
			  //getWorkSheet(requestObj,responseObj);
			  //createWorkSheet(requestObj,responseObj);
		});
   }
   
   function createWorkSheet(requestObj,responseObj)
   {
		 console.log('In Callback createWorkSheet ');
		var workSheetData = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gs="http://schemas.google.com/spreadsheets/2006">  <title>Device List</title>  <gs:rowCount>50</gs:rowCount>  <gs:colCount>8</gs:colCount></entry>';
		
		
		
		var getGoogleDocFileURL = "https://spreadsheets.google.com/feeds/worksheets/" + requestObj.session.spreadSheetId + "/private/full";
		 var requestOptions = 
		 {  'uri': getGoogleDocFileURL,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'POST',
			'headers' :   {
				  'Authorization' : 'Bearer ' + requestObj.session.access_token,
				  'Content-Type': 'application/atom+xml'
			  }
		}; 
		
		 request(requestOptions,function (error, response, body) 
		 {
			  console.log('In Callback After creating Google worksheet');
			  console.log(response.statusCode);
			  console.log(response.body);
			  //console.log(response.body.items[0].id);
			  //var googleResponse =  JSON.parse(response.body);
			  //requestObj.session.spreadSheetId = googleResponse.items[0].id;
		});
		
   }
   
    function getWorkSheet(requestObj,responseObj)
   {
		
		console.log('GET Worksheet FEED');
		var workSheetFeed = "https://spreadsheets.google.com/feeds/spreadsheets/private/full";
		 var requestOptions = 
		 {  'uri': workSheetFeed,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'GET',
			'headers' :   {
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  }
		}; 
		
		 request(requestOptions,function (error, response, body) 
		 {
			  console.log('In Callback After GET request for Google Spreadsheet');
			  console.log(response.statusCode);
			  //console.log(response.body);
			  //console.log(response.headers);
			  //console.log(response.body.items[0].id);
			  //var googleResponse =  JSON.parse(response.body);
			  //requestObj.session.spreadSheetId = googleResponse.items[0].id;
		});
		
   }
   
   function writeToGoogleSpreadSheet(requestObj,responseObj)
   {
   }
   
   function readFile(requestObj,responseObj)
   {
		if(requestObj) console.log('request obj exists');
	   fs.readFile('WMTEST_FILE.xls', function(err,data)
	   {
		  if(err) {
			console.error("Could not open file: %s", err);
			process.exit(1);
		  }

			uploadFile(requestObj,responseObj,data);
			//console.log(data);
			//return data;
		});
	
	}
	
	function uploadFile(requestObj,responseObj,fileData)
	{
		if(requestObj) console.log('request obj exists');
		 var uploadRequestOptions = 
		 {  'uri': requestObj.session.locationURI,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'PUT',
			'headers' :   {
				  'Content-Type': 'application/vnd.ms-excel',
				 // 'Content-Length' : fileData.length,
				  //'Content-Type': 'application/json',
				  //'Authorization' : requestObj.session.access_token
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  },
			'body' : fileData
		}; 
				
		request(uploadRequestOptions,function (error, response, body) 
		{
			console.log('In Callback After Uploading Excel Sheet');
			console.log(response.statusCode);
			console.log(response.headers);
		});
	}
	
	function readSpreadSheet(requestObj,responseObj)
	{
		console.log('In readSpreadSheet');
		var xmlListFeed = 'https://spreadsheets.google.com/feeds/list/' + requestObj.session.workSheetId +  '/1/private/full';
		var xmlCellFeed = 'https://spreadsheets.google.com/feeds/cells/' + requestObj.session.workSheetId +  '/1/private/full';
		
		var requestOptions = 
		 {  'uri': xmlListFeed,
			'proxy': 'http://cwybcproxy.us.dnb.com:8080/',
			'method' : 'GET',
			'headers' :   {
				  'Authorization' : 'Bearer ' + requestObj.session.access_token
			  }
		}; 

		 request(requestOptions,function (error, response, body) 
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
				
				responseObj.json(deviceArray);
				
				//console.log(JSON.stringify(result));
			  })
			  //var googleResponse =  JSON.parse(response.body);
			  //console.log(googleResponse.items[0].id);
			  //requestObj.session.workSheetId = googleResponse.items[0].id;
			  //getWorkSheet(requestObj,responseObj);
			  //createWorkSheet(requestObj,responseObj);
		});
		
	}