
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , restservices = require('./dcr-rest-services')
  , extrestservices = require('./dcr-ext-rest-services')
  , http = require('http')
  ,resource = require('express-resource');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/gdrive', routes.gdrive);
app.get('/ajaxtest', routes.ajaxtest);
app.get('/research', routes.research);


var restService = app.resource('dcrest',restservices);
restService.map('get','/comp_search',restservices.company_search);
restService.map('get','/comp_rep',restservices.company_report);

var extRest = app.resource('dcrestext',extrestservices);
extRest.map('get','/ln_profile',extrestservices.ln_profile);
extRest.map('get','/bing_search',extrestservices.bing_search);
extRest.map('get','/google_search',extrestservices.google_search);
extRest.map('get','/ln_search',extrestservices.ln_search);
extRest.map('get','/ln_search_node',extrestservices.ln_search_node);
extRest.map('get','/maxcv',extrestservices.maxcv);

app.listen(3001, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
