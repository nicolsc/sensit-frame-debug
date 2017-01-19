#Sensit v2 - Frame debug
##What
* Fetch the last messages for a given deviceid
* Try to parse the frame, to extract
  * Active mode
  * Frame type
  * Battery level
  * Approx temperature 
  * Precise temperature if relevant
  * Humidity % if relevant



##Prerequisites 

Your [Sensit](http://sensit.io) should be registered to your [SIGFOX](http://makers.sigfox.com) account, as this app is using the SIGFOX API.  


##Install

You should have  [NodeJS](http://nodejs.org) 5.0 up & running on your machine


	$ npm install
	$ npm start

##Configure

Set the following env vars in a local `config.js`, with your SIGFOX API Credentials: 

	module.exports = {
	  SIGFOX_USERNAME: 'xxx',
	  SIGFOX_PASSWORD: 'xxx'
	};

##Use

Open [http://localhost:8000/{deviceId}](http://localhost:8000/{deviceId})




