
/*
 * GET home page.
 */

exports.index = function(req, res)
{
  var googleLoginURI = "https://accounts.google.com/o/oauth2/auth?" + 
                                  //"scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&" +
								  "scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+" +
								  "https%3A%2F%2Fspreadsheets.google.com%2Ffeeds+https%3A%2F%2Fdocs.google.com%2Ffeeds+" +
								  "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&" +
                                  "state=%2Fprofile&" +
								  "redirect_uri=http%3A%2F%2Flocalhost:3001%2Fwmrest%2Fauthorize&" +
								  "response_type=code&origin=http%3A%2F%2Flocalhost%3A3001&" +
								  "client_id=930662704169-25secosrcggebfi0o2782enonuqfq1p8.apps.googleusercontent.com";

  var email = '';							  
  if(req.session.username)
		email = req.session.username;
							
  res.render('index_3',{
								'googleLoginURI':googleLoginURI ,
								'email': email }
				);
};