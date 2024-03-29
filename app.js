var express = require('express')
  , routes = require('./routes')
  , http = require('http')
   ,services = require('./services')
  ,resource = require('express-resource');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'wmdev' }));
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


var servicesHandle = app.resource('wmrest',services);
servicesHandle.map('get','/authorize',services.authorize);
servicesHandle.map('post','/save_device',services.save_device);
servicesHandle.map('post','/atomic_save',services.atomic_save);
servicesHandle.map('get','/loadDeviceData',services.loadDeviceData);
servicesHandle.map('get','/getFileURL',services.getFileURL);

app.listen(3001, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
