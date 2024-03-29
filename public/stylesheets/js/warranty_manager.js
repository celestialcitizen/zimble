	var deviceName =  '' , modelName =  '' , purchaseDate =  '' , expiryDate =  '' ,coveragePeriod =  '' ,emailAlert =  '', deviceCount = 0, deviceArray = {}, activeDeviceID = '' ,userinfo = {};
    var currentScreen = 'home', notes = '';
	
	var eventId = '' , eventFlag = true;
	
	var baseURL = 'http://localhost:3001';
		
		function elementExists(selector)
		{
			if($(selector).length == 0)
				return false;
			else
				return true;
		}
	 
		function resetForm()
		{
			//$('input#dev_name,input#mod_det,input#p_date,input#c_period,#timezone').val('');
			$('input#dev_name,input#p_date,input#e_date,input#notes').val('');
			$('input#e_alert').removeAttr('checked');
			$('a#ok_btn').text('Add');
			//$('#timezone').hide();
			activeDeviceID = '';
		}
		
		function validateForm()
		{
			var errorMessage = '', errorFlag = false;
			deviceName =  '' , modelName =  '' , purchaseDate =  '' ,coveragePeriod =  '' ,emailAlert =  '', notes = '';
			notes = $('textarea#notes').val();
			
			var purchaseDateObj , expiryDateObj;
			
			if(  $('input#dev_name').val() )
			{
				deviceName = $('input#dev_name').val();
			}
			else
			{
				errorFlag = true;
				//errorMessage = errorMessage + 'input#dev_name,';
				errorMessage = errorMessage + 'Device Name is Empty,';
			}
			
			/*if(  $('input#mod_det').val() )
			{
				modelName = $('input#mod_det').val();
			}
			else
			{
				errorFlag = true;
				errorMessage = errorMessage + 'input#mod_det,';
			}*/
			
			if(  $('input#p_date').val() )
			{
				purchaseDate = $('input#p_date').val();
				var year = purchaseDate.split('/')[2] - 0, month = purchaseDate.split('/')[1] - 1, day = purchaseDate.split('/')[0];
				purchaseDateObj = moment(new Date(year,month,day));
			}
			else
			{
				errorFlag = true;
				//errorMessage = errorMessage + 'input#p_date,';
				errorMessage = errorMessage + 'Purchase Date is Empty,';
			}
			
			if(  $('input#e_date').val() )
			{
				expiryDate = $('input#e_date').val();
				var year = expiryDate.split('/')[2] - 0, month = expiryDate.split('/')[1] - 1, day = expiryDate.split('/')[0];
				expiryDateObj = moment(new Date(year,month,day));
			}
			else
			{
				errorFlag = true;
				//errorMessage = errorMessage + 'input#e_date,';
				errorMessage = errorMessage + 'Expiry Date is Empty,';
			}
			
			/*if(  $('input#c_period').val() && isNormalInteger($('input#c_period').val()) )
			{
				coveragePeriod = $('input#c_period').val();
			}
			else
			{
				errorFlag = true;
				errorMessage = errorMessage + 'input#c_period,';
			}*/
			
			emailAlert = $('input#e_alert').is(':checked') ? 'Yes': 'No';
			
			if(purchaseDateObj && expiryDateObj)
			{
				if(expiryDateObj.diff(purchaseDateObj) < 0 )
				{
					errorFlag = true;
				
					errorMessage = errorMessage + 'Purchase date is greater than expiry date,';
				}
			}
			
			if(errorFlag)
			{
				//$(errorMessage).tooltip('show');
				$('div#add_device_err h4.alert-heading').text(errorMessage);
				$('div#add_device_err').show('slow');
				//$('div#add_device_err').show('slow',function(){ $(errorMessage).tooltip('show');});
			}
			else
			{
				$('div#add_device_err').hide('slow',function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period').tooltip('hide');});
			}
			return errorFlag;
		}
	 
	 
		function isNormalInteger(str) 
		{
			var n = ~~Number(str);
			return String(n) === str && n > 0;
		}
		
		function addDevice()
		{
			/*var year = purchaseDate.split('/')[2] - 0, month = purchaseDate.split('/')[1] - 1, day = purchaseDate.split('/')[0];
			
			var addYears = 0, addMonths = 0;
			coveragePeriod = parseInt(coveragePeriod);
			if(coveragePeriod > 11)
			{
				addYears = coveragePeriod / 12;
				addMonths = coveragePeriod % 12;
			}
			else
			{
				addMonths = coveragePeriod;
			}
			
			var expiryDate = new Date(year + addYears,month + addMonths,day);
			
			var expiryDateString = expiryDate.getFullYear() + '-' + (expiryDate.getMonth() + 1) + '-' + expiryDate.getDate();
			var expiryDateStringUI = expiryDate.getDate() + '/' + (expiryDate.getMonth() + 1) + '/' + expiryDate.getFullYear();*/
			var tempDeviceObj = 
			{
				'devicename' : deviceName,
				//'modeldetails' : modelName,
				'purchasedate' : purchaseDate,
				//'coverageperiod' : coveragePeriod,
				'emailalert' : emailAlert,
				//'expirydate' : expiryDateString
				'expirydate' : expiryDate,
				'notes' : notes
			}
			
			if(activeDeviceID == '')
			{
				deviceArray['dev_' + deviceCount] = tempDeviceObj;
				//var newDeviceRowHTML = '<tr><td><a class="span2 btn btn-primary device_data"  id="dev_' +  deviceCount + ' "> ' + deviceName + '</a> </td></tr>';
				//var newDeviceRowHTML = '<tr><td><a class="span2 device_data"  id="dev_' +  deviceCount + '"> ' + deviceName + '</a> </td><td><a class="span2"> ' + expiryDateStringUI + 
				//var newDeviceRowHTML = '<tr><td><a class="span2 device_data"  id="dev_' +  deviceCount + '"> ' + deviceName + '</a> </td><td><a class="span2"> ' + expiryDate + 
				//'</a></td><td><i class="icon-trash"></i></td></tr>';
				var newDeviceRowHTML = '<tr><td><a class="span3 device_data"  id="dev_' +  deviceCount + '"> ' + deviceName + '</a> </td><td> <i class="icon-edit"></i> </td>' + 
				'<td> <i class="icon-trash"></i> </td></tr>';
				//$('div#device_list').append(newDeviceRowHTML);
				$('tbody').append(newDeviceRowHTML);
				atomicSaveDevice('dev_' + deviceCount);
				deviceCount++;
			}
			else
			{
				tempDeviceObj['updateurl'] = deviceArray[activeDeviceID]['updateurl'];
				tempDeviceObj['eventid'] = deviceArray[activeDeviceID]['eventid'];
				//to keep check if the event associated should be updated based on date
				if(!eval(checkObjUpdates(deviceArray[activeDeviceID])))
				{
					 deviceArray[activeDeviceID]['eventFlag'] = true;
				}
				else
				{
					deviceArray[activeDeviceID]['eventFlag'] = false;
				}
				deviceArray[activeDeviceID] = tempDeviceObj;
				var deviceIDRowSelector = 'a#' + activeDeviceID;
				$(deviceIDRowSelector).text(deviceName);
				//$(deviceIDRowSelector).parent().next().html('<a class="span2"> ' + expiryDateStringUI + '</a>');
				//$(deviceIDRowSelector).parent().next().html('<a class="span2"> ' + expiryDate + '</a>');
				atomicSaveDevice(activeDeviceID);
			}
			//resetForm();
			//$('div#add_device_err').hide(function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period,input#e_alert').tooltip('hide');});
		}
		
		function checkObjUpdates(oldObj)
		{
			//if(purchaseDate == oldObj.purchasedate && coveragePeriod == oldObj.coverageperiod)
			if(purchaseDate == oldObj.purchasedate && expiryDate == oldObj.expiryDate)
				return true;
			else
				return false;
			
			//return updObj == oldObj;
		}
		
		function saveDevice()
		{
			//appending userinfo in device array
			//deviceArray['userinfo'] = userinfo;
			var savingHTML = '<h4> Saving Data ... <img src="stylesheets/img/ajax-loader.gif" /> </h4>  ';
			$('div#load_alert').html(savingHTML);
			
			$.ajax({
			  type: 'POST',
			  url: '/wmrest/save_device',
			  data: deviceArray,
			  success: function(result)
			  {  
					if(result['status'] == 'error')
					{
						$('div#load_alert').addClass('alert-error');
						$('div#load_alert').html('<h4> Error Saving Changes </h4>');
					}
					
					if(result['status'] == 'success')
					{
						$('div#load_alert').addClass('alert-success');
						$('div#load_alert').html('<h4> Changes Saved Successfully </h4>');
					}
					
					setTimeout(function() 
					{
						$('div#load_alert').hide('slow');
						$('div#load_alert').removeClass('alert-error');
						$('div#load_alert').removeClass('alert-success');
						
					}, 5000);
			  }
			  //dataType: dataType
			});
		}
		
		
		
		function atomicSaveDevice(deviceKey)
		{
			//deviceArray[deviceKey]['userinfo'] = userinfo;
			var savingHTML = '<h4> Saving Data ... <img src="stylesheets/img/ajax-loader.gif" /> </h4>  ';
			$('div#save_alert').show('slow');
			$('div#save_alert').html(savingHTML);
			
			$.ajax({
			  type: 'POST',
			  url: '/wmrest/atomic_save',
			  data: deviceArray[deviceKey],
			  success: function(result)
			  {  
					if(result['status'] == 'error')
					{
						$('div#save_alert').removeClass('alert-success');
						$('div#save_alert').addClass('alert-error');
						$('div#save_alert').html('<h4> Error Saving Changes </h4>');
						resetForm();
						$('div#add_device_err').hide(function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period,input#e_alert').tooltip('hide');});
					}
					else 
					{
						$('div#save_alert').removeClass('alert-error');
						$('div#save_alert').addClass('alert-success');
						$('div#save_alert').html('<h4> Changes Saved Successfully </h4>');
						resetForm();
						//$('div#add_device_err').hide(function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period,input#e_alert').tooltip('hide');});
						$('div#add_device_err').hide(function(){ $('input#dev_name,input#p_date,input#e_date,input#notes').tooltip('hide');});
						//deviceCount++;
						if(result['curr_obj'] && result['curr_obj']['updateurl'] && result['curr_obj']['eventid'])
						{
							deviceArray[deviceKey]['updateurl'] = result['curr_obj']['updateurl'];
							deviceArray[deviceKey]['eventid'] = result['curr_obj']['eventid'];
						}
						goToDeviceList();
					}
					
					setTimeout(function() 
					{
						$('div#load_alert').hide('slow');
						$('div#load_alert').removeClass('alert-error');
						$('div#load_alert').removeClass('alert-success');
						
					}, 5000);
			  }
			  //dataType: dataType
			});
		}
		
		function deleteDevice(deviceKey)
		{
			//deviceArray[deviceKey]['userinfo'] = userinfo;
			var updateurl = deviceArray[deviceKey]['updateurl'];
			deviceArray[deviceKey]['deleteurl'] = updateurl;
			delete deviceArray[deviceKey]['updateurl'];
			
			
			var savingHTML = '<h4> Deleting Device ... <img src="stylesheets/img/ajax-loader.gif" /> </h4>  ';
			$('div#load_alert').show('slow');
			$('div#load_alert').html(savingHTML);
			
			
			$.ajax({
			  type: 'POST',
			  url: '/wmrest/atomic_save',
			  data: deviceArray[deviceKey],
			  success: function(result)
			  {  
					if(result['status'] == 'error')
					{
						$('div#load_alert').addClass('alert-error');
						$('div#load_alert').html('<h4> Error Deleting Device </h4>');
						resetForm();
						//$('div#add_device_err').hide(function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period,input#e_alert').tooltip('hide');});
						$('div#add_device_err').hide(function(){ $('input#dev_name,input#p_date,input#e_date,input#notes').tooltip('hide');});
					}
					
					if(result['status'] == 'success')
					{
						$('div#load_alert').addClass('alert-success');
						$('div#load_alert').html('<h4> Deleted Device Successfully </h4>');
						resetForm();
						$('div#add_device_err').hide(function(){ $('input#dev_name,input#p_date,input#e_date,input#notes').tooltip('hide');});
						$('a#'+deviceKey).parent().parent().remove();
						delete deviceArray[deviceKey];
					}
					
					setTimeout(function() 
					{
						$('div#load_alert').hide('slow');
						$('div#load_alert').removeClass('alert-error');
						$('div#load_alert').removeClass('alert-success');
						
					}, 3000);
			  }
			  //dataType: dataType
			});
		}
		
		function checkLogin()
		{
			return ! ($('a#email').length == 0);
		}
		
		function getDevices()
		{
			$.get('/wmrest/loadDeviceData',function(data)
			{
				deviceArray = data;
				$('div#load_alert').hide('slow');
				loadDevices();
				getSpreadSheetURL();
			});
		}
		
		function getSpreadSheetURL()
		{
			$.get('/wmrest/getFileURL',function(data)
			{
				if(data.url)
				{
					$('a#spreadsheet_link').attr('href',data.url);
				}
				else if(data.error)
				{
					console.log('Error Fetching Spreadsheet URL ' + data.error);
				}
			});
		}
		
		function loadDevices()
		{
			deviceCount = Object.keys(deviceArray).length;
			
			$('tbody').empty();
			for(var devCtr = 0; devCtr < deviceCount; devCtr++)
			{
				/*var newDeviceRowHTML = '<tr><td><a class="span2 device_data"  id="dev_' +  devCtr + '"> ' + deviceArray['dev_' + devCtr].devicename + '</a> </td><td><a class="span2"> ' + deviceArray['dev_' 
				+ devCtr].expirydate + '</a></td><td><i class="icon-trash"></i></td></tr>';*/
				var newDeviceRowHTML = '<tr><td><a class="span3 device_data"  id="dev_' +  devCtr + '"> ' + deviceArray['dev_' + devCtr].devicename + '</a> </td><td> <i class="icon-edit"></i> </td>' + 
				'<td> <i class="icon-trash"></i> </td></tr>';
				$('tbody').append(newDeviceRowHTML);
			}
		}
		
		function loadPanel(deviceID)
		{
			 $('input#dev_name').val(deviceArray[deviceID].devicename);
			 //$('input#mod_det').val(deviceArray[deviceID].modeldetails);
			 $('input#p_date').val(deviceArray[deviceID].purchasedate);
			 $('input#e_date').val(deviceArray[deviceID].expirydate);
			 $('input#notes').val(deviceArray[deviceID].notes);
			 //$('input#c_period').val(deviceArray[deviceID].coverageperiod);
			 if(deviceArray[deviceID].emailalert == 'Yes')
			 {
				$('input#e_alert').attr('checked','checked');
			}
			else
			{
				$('input#e_alert').removeAttr('checked');
			}
			
			 $('a#ok_btn').text('Update');
			 //setting the global variable
			 activeDeviceID =  deviceID;
			 //$('input#dev_name').val(deviceArray['dev_' +deviceID].devicename);
		}
		
		
		function goToDeviceList()
		{
			
				$('div#add_device_modal').hide('slide',{direction:'left'},500,function()
				{
					$('div#account_page').show('slide',{direction:'right'},500);
					currentScreen = 'deviceList';
					$('div#save_alert').hide();
					$('div#save_alert').removeClass('alert-error');
					$('div#save_alert').removeClass('alert-success');
					resetForm();
				});
		}
		
		$(document).ready(function() 
		{
			var addDeviceHTML = '<tr><td> <button class="btn btn-primary" type="button" id="add-device">Add A Device</button> </td></tr>';
			
			var deviceArray = {};
			var deviceCount = 0;
			
			//if the user is authenticated successfully then redirect him to the accounts page
			if( eval(elementExists('a#email')) )
			{
				if( currentScreen != 'deviceList' &&  currentScreen != 'deviceDetails')
				{
					//$(this).parent().addClass('active');
					$('div#home_page').hide('slide',{direction:'left'},500,function()
					{
						$('div#account_page').show('slide',{direction:'right'},500);
						currentScreen = 'deviceList';
						if(eval(jQuery.isEmptyObject(deviceArray)))
						{
							getDevices();
							//getSpreadSheetURL();
						}
					});
				}
			}
			
			$('a#accounts,a#email').click(function(event)
			{
				event.preventDefault();
				if(eval(checkLogin()) )
				{
					
					//if( ! $(this).parent().hasClass('active'))
					if( currentScreen != 'deviceList' &&  currentScreen != 'deviceDetails')
					{
						$(this).parent().addClass('active');
						$('div#home_page').hide('slide',{direction:'left'},500,function()
						{
							$('div#account_page').show('slide',{direction:'right'},500);
							currentScreen = 'deviceList';
							if(eval(jQuery.isEmptyObject(deviceArray)))
							{
								getDevices();
								//getSpreadSheetURL();
							}
						});
					}
				}
				else
				{
					$(this).parent().removeClass('active');
					alert('Login To Access Your Gadgets');
				}
				
			});
			
			$('a#home').click(function(event)
			{				
				event.preventDefault();
				//if( $('a#accounts').parent().hasClass('active'))
				if( currentScreen != 'home' )
				{
					//$(this).parent().addClass('active');
					$('a#accounts').parent().removeClass('active');
					$('a#email').parent().removeClass('active');
					
					if(currentScreen == 'deviceList')
					{
						$('div#account_page').hide('slide',{direction:'left'},500,function()
						{
							$('div#home_page').show('slide',{direction:'right'},500);
							currentScreen = 'home';
						});
					}
					else if(currentScreen == 'deviceDetails')
					{
						$('div#add_device_modal').hide('slide',{direction:'left'},500,function()
						{
							$('div#home_page').show('slide',{direction:'right'},500);
							currentScreen = 'home';
						});
					}
				}
			});			
			
			
			$('a#example').click(function(event)
			{
				event.preventDefault();
				$('div#home_page').hide('slide',{direction:'left'},500,function()
				{
					$('div#example_data').show('slide',{direction:'right'},500);
					currentScreen = 'exampleData';
				});
			});
			
			
			$('a#back_home').click(function(event)
			{
				event.preventDefault();
				$('div#example_data').hide('slide',{direction:'left'},500,function()
				{
					$('div#home_page').show('slide',{direction:'right'},500);
					currentScreen = 'home';
				});
			});
			
			$('a#ok_btn').click(function(event)
			{
				event.preventDefault();
				//form validation
				if( ! validateForm() )
				{
					addDevice();
					
					//$('#add_device_modal').modal('hide');
					//$('div#load_alert').html('<h4> Save Your Changes ... </h4>');
					//$('div#load_alert').show('slow');
				}
				
			});
			
			$('a#cancel_btn').click(function(event)
			{
				event.preventDefault();				
				//$('input#dev_name,input#mod_det,input#p_date,input#c_period,input#e_alert').tooltip('hide');
				$('input#dev_name,input#p_date,input#e_date,input#notes').tooltip('hide');
				$('div#add_device_err').hide();
				goToDeviceList();
				//$('#add_device_modal').modal('hide');
				
			});
			
			$('button#save_device').click(function()
			{
				saveDevice();
			});
			
			$('i.icon-trash').live('click',function(event)
			{
				var deviceKey = $(this).parent().prev().prev().children('a.device_data').attr('id');
				deleteDevice(deviceKey);
				//saveDevice();
			});
			
			$('i.icon-edit').live('click',function(event)
			{
				var deviceKey = $(this).parent().prev().children('a.device_data').attr('id');
				$('div#account_page').hide('slide',{direction:'left'},500,function()
				{
					
					$('div#add_device_modal').show('slide',{direction:'right'},500);
					currentScreen = 'deviceDetails';
					loadPanel(deviceKey);
					$('div#save_alert').hide();
					$('#p_date').datepicker({format: 'dd/mm/yyyy'});
					$('#e_date').datepicker({format: 'dd/mm/yyyy'});
				});
				//saveDevice();
			});
			
			/*$('#add_device_modal').on('shown',function()
			{
				$('#p_date').datepicker({format: 'dd/mm/yyyy'});
			});
			
			$('#add_device_modal').on('hidden',function()
			{
				activeDeviceID = '';
				resetForm();
			});*/
			
			//$('button#add_device_button').click(function(event)
			$('button#add_device_button').on('click',function(event)
			{
			
				$('div#account_page').hide('slide',{direction:'left'},500,function()
				{
					
					$('div#add_device_modal').show('slide',{direction:'right'},500);
					$('div#save_alert').hide();
					$('#p_date').datepicker({format: 'dd/mm/yyyy'});
					$('#e_date').datepicker({format: 'dd/mm/yyyy'});
					currentScreen = 'deviceDetails';
				});
			});
			
			$('a.device_data').live('click',function(event)
			{
				event.preventDefault();
				/*var deviceID =  $(this).attr('id');
				$('div#account_page').hide('slide',{direction:'left'},500,function()
				{
					
					$('div#add_device_modal').show('slide',{direction:'right'},500);
					currentScreen = 'deviceDetails';
					loadPanel(deviceID);
					$('div#save_alert').hide();
					$('#p_date').datepicker({format: 'dd/mm/yyyy'});
					$('#e_date').datepicker({format: 'dd/mm/yyyy'});
				});*/
				
				//$('#add_device_modal').modal();
			});
				
			
		});