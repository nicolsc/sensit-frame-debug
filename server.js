'use strict';
require('./loadConfig.js');


const Hapi = require('hapi');
var sigfox = require('./sigfox.js');
// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000 
});


server.register([{register:require('vision')}, {register:require('inert')}], (err) => {
  if (err){
    throw err;
  }
  server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'views'
    });
});

// Add the route
server.route({
    method: 'GET',
    path:'/offline', 
    handler:function(request, reply){
      console.log('GET /offline');
      reply.view('index', {messages: sigfox.getOfflineMessages(), deviceId:'OFFLINE'});     
    }
});
server.route({
    method: 'GET',
    path:'/{deviceId?}', 
    handler:function(request, reply){
      console.log('[%s] %s', request.method, request.path);
      if (!request.params.deviceId){
        request.params.deviceId = process.env.DEVICEID;
      }
      
      if (!request.params.deviceId.match(/^([0-F]*)$/i)){
        return reply('Invalid deviceId '+request.params.deviceId);
      }
      
      
      sigfox.getMessages(request.params.deviceId)
     .then(function(messages){
       reply.view('index', {messages:messages, deviceId:request.params.deviceId});
     })
     .catch(function(err){
      console.warn(err);
       reply(err);
      });
    }
});


server.route({
    method: 'GET',
    path: '/{file}.css',
    handler: function (request, reply) {
      reply.file("./static/css/"+request.params.file+".css");
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});


