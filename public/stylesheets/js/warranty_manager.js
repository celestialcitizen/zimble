	var deviceName =  '' , modelName =  '' , purchaseDate =  '' ,coveragePeriod =  '' ,emailAlert =  '', deviceCount = 0, deviceArray = {}, activeDeviceID = '' ,userinfo = {};
		
	 
		function resetForm()
		{
			$('input#dev_name,input#mod_det,input#p_date,input#c_period,#timezone').val('');
			$('input#e_alert').removeAttr('checked');
			 $('a#ok_btn').text('Add');
			 $('#timezone').hide();
			activeDeviceID = '';
		}
		
		function validateForm()
		{
			var errorMessage = '', errorFlag = false;
			deviceName =  '' , modelName =  '' , purchaseDate =  '' ,coveragePeriod =  '' ,emailAlert =  '';
			
			if(  $('input#dev_name').val() )
			{
				deviceName = $('input#dev_name').val();
			}
			else
			{
				errorFlag = true;
				errorMessage = errorMessage + 'input#dev_name,';
			}
			
			if(  $('input#mod_det').val() )
			{
				modelName = $('input#mod_det').val();
			}
			else
			{
				errorFlag = true;
				errorMessage = errorMessage + 'input#mod_det,';
			}
			
			if(  $('input#p_date').val() )
			{
				purchaseDate = $('input#p_date').val();
			}
			else
			{
				errorFlag = true;
				errorMessage = errorMessage + 'input#p_date,';
			}
			
			if(  $('input#c_period').val() && isNormalInteger($('input#c_period').val()) )
			{
				coveragePeriod = $('input#c_period').val();
			}
			else
			{
				errorFlag = true;
				errorMessage = errorMessage + 'input#c_period,';
			}
			
			emailAlert = $('input#e_alert').is(':checked') ? 'Yes': 'No';
			
			//if the user wants an email alert and timezone is not set
			//validate the timezone value
			if(emailAlert == 'Yes' && !userinfo['timezone'])
			{
				if( $('#timezone').val() != '-1' )
				{					
					userinfo['timezone'] = $('#timezone').val();
				}
				else
				{
					errorFlag = true;
					errorMessage = errorMessage + '#timezone,';
				}
			}
			
			if(errorFlag)
			{
				//$(errorMessage).tooltip('show');
				$('div#add_device_err').show('slow',function(){ $(errorMessage).tooltip('show');});
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
			var year = purchaseDate.split('/')[2] - 0, month = purchaseDate.split('/')[1] - 1, day = purchaseDate.split('/')[0];
			//var tempPurchaseDate = new Date(year,month,day);
			//var expiryDate = new Date(new Date(tempPurchaseDate).setMonth(tempPurchaseDate.getMonth()+ coveragePeriod));
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
			//console.log(expiryDate.getMonth());
			//expiryDate.setMonth(expiryDate.getMonth() + coveragePeriod);
			var expiryDateString = expiryDate.getDate() + '/' + (expiryDate.getMonth() + 1) + '/' + expiryDate.getFullYear();
			var tempDeviceObj = 
			{
				'devicename' : deviceName,
				'modeldetails' : modelName,
				'purchasedate' : purchaseDate,
				'coverageperiod' : coveragePeriod,
				'emailalert' : emailAlert,
				'expirydate' : expiryDateString
			}
			
			if(activeDeviceID == '')
			{
				deviceArray['dev_' + deviceCount] = tempDeviceObj;
				//var newDeviceRowHTML = '<tr><td><a class="span2 btn btn-primary device_data"  id="dev_' +  deviceCount + ' "> ' + deviceName + '</a> </td></tr>';
				var newDeviceRowHTML = '<tr><td><a class="span2 device_data"  id="dev_' +  deviceCount + '"> ' + deviceName + '</a> </td><td><a class="span2"> ' + expiryDateString + '</a></td></tr>';
				//$('div#device_list').append(newDeviceRowHTML);
				$('tbody').append(newDeviceRowHTML);
				deviceCount++;
			}
			else
			{
				tempDeviceObj['updateurl'] = deviceArray[activeDeviceID]['updateurl'];
				deviceArray[activeDeviceID] = tempDeviceObj;
				var deviceIDRowSelector = 'a#' + activeDeviceID;
				$(deviceIDRowSelector).text(deviceName);
				$(deviceIDRowSelector).parent().next().html('<a class="span2"> ' + expiryDateString + '</a>');
			}
			resetForm();
			$('div#add_device_err').hide(function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period').tooltip('hide');});
		}
		
		function saveDevice()
		{
			//appending userinfo in device array
			deviceArray['userinfo'] = userinfo;
			
			$.ajax({
			  type: 'POST',
			  url: 'http://localhost:3001/wmrest/save_device',
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
			});
		}
		
		function loadDevices()
		{
			deviceCount = Object.keys(deviceArray).length;
			
			$('tbody').empty();
			for(var devCtr = 0; devCtr < deviceCount; devCtr++)
			{
				var newDeviceRowHTML = '<tr><td><a class="span2 device_data"  id="dev_' +  devCtr + '"> ' + deviceArray['dev_' + devCtr].devicename + '</a> </td><td><a class="span2"> ' + deviceArray['dev_' + devCtr].expirydate + '</a></td></tr>';
				$('tbody').append(newDeviceRowHTML);
			}
		}
		
		function loadPanel(deviceID)
		{
			 $('input#dev_name').val(deviceArray[deviceID].devicename);
			 $('input#mod_det').val(deviceArray[deviceID].modeldetails);
			 $('input#p_date').val(deviceArray[deviceID].purchasedate);
			 $('input#c_period').val(deviceArray[deviceID].coverageperiod);
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
		
		$(document).ready(function() 
		{
			var addDeviceHTML = '<tr><td> <button class="btn btn-primary" type="button" id="add-device">Add A Device</button> </td></tr>';
			
			var deviceArray = {};
			var deviceCount = 0;
			
			$('a#accounts').click(function(event)
			{
				event.preventDefault();
				if(eval(checkLogin()))
				{
					if( ! $(this).parent().hasClass('active'))
					{
						$(this).parent().addClass('active');
						$('div#home_page').hide('slide',{direction:'left'},500,function()
						{
							$('div#account_page').show('slide',{direction:'right'},500);
							getDevices();
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
				if( ! $(this).parent().hasClass('active'))
				{
					$(this).parent().addClass('active');
					$('a#accounts').parent().removeClass('active');
					$('div#account_page').hide('slide',{direction:'left'},500,function()
					{
						$('div#home_page').show('slide',{direction:'right'},500);
					});
				}
			});			
			
			$('a#ok_btn').click(function(event)
			{
				event.preventDefault();
				//form validation
				if( ! validateForm() )
				{
					addDevice();
					$('#add_device_modal').modal('hide');
					$('div#load_alert').html('<h4> Save Your Changes ... </h4>');
					$('div#load_alert').show('slow');
				}
				
			});
			
			$('button#save_device').click(function()
			{
				saveDevice();
			});
			
			$('#add_device_modal').on('shown',function()
			{
				
				$('#p_date').datepicker({format: 'dd/mm/yyyy'});
				//if(userinfo['timezone'])
				//	$('#timezone').hide();
				
				//$('input#dev_name,input#dev_name,input#p_date,input#c_period').tooltip('hide');
			
			});
			
			$('#add_device_modal').on('hidden',function()
			{
				activeDeviceID = '';
				resetForm();
			});
			
			$('button#add_device_button').click(function(event)
			{
				$('#add_device_modal').modal();
				//$('#add_device_modal').on('hidden',function()
				//{
					//$('input#c_period').tooltip('hide');
					//$('input#dev_name,input#dev_name,input#p_date,input#c_period').tooltip('hide');
					//resetForm();
					//$('div#add_device_err').hide(function(){ $('input#dev_name,input#mod_det,input#p_date,input#c_period').tooltip('hide');});
					
				//});
			});
			
			$('a.device_data').live('click',function(event)
			{
				event.preventDefault();
				var deviceID =  $(this).attr('id');
				loadPanel(deviceID);
				$('#add_device_modal').modal();
			});
				
			$('input#e_alert').change(function()
			{
				if($('input#e_alert').is(':checked') && !userinfo['timezone'])
				{
					$('#timezone').show('slow');
				}
				else
				{
					$('#timezone').show('hide');
				}
			});
		});