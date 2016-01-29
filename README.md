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


##Install

You should have  [NodeJS](http://nodejs.org) 5.0 up & running on your machine


	$ npm install
	$ npm start

##Configure

Set the following env vars in a longocal `config.js`, with your SIGFOX API Credentials: 

	module.exports = {
	  SIGFOX_USERNAME: 'xxx',
	  SIGFOX_PASSWORD: 'xxx'
	};

##Use

Open [http://localhost:8000/{deviceId}](http://localhost:8000/{deviceId})




