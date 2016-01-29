const request = require('request-promise');
const moment = require('moment');
require('./loadConfig');


var SIGFOXMsg = function(msg){
  this.frame = Number(parseInt(msg.data, 16));
  this.frameStr = msg.data;
  this.time = msg.time * 1000;
  this.parse();
};
SIGFOXMsg.prototype.parse = function(){
  this.getDate();
  this.getBinary();
  this.getBytes();
  this.getMode();
  this.getBattery();
  
  this.getValues();
};
SIGFOXMsg.prototype.getDate = function(){
  this.date = moment(this.time).calendar();
};
SIGFOXMsg.prototype.getBinary = function(){
  this.binary = this.frame.toString(2);
};
SIGFOXMsg.prototype.getBytes = function(){
  this.bytes = [];
  this.frameStr.match(/[0-f]{1,2}/g).forEach(function (byte){
    this.bytes.push(parseInt(byte, 16));
  }.bind(this));
};
SIGFOXMsg.prototype.getMode = function(){
  //Mode : bits 1 to 3
  var mode = this.bytes[0] & 0b111;
  //frame type: bits 6 & 7
  var frameType = (this.bytes[0] >> 4) & 0b11;
  
  switch (mode){
      case 0: this.mode='Button';
        break;
      case 1: this.mode='Temperature';
        break;
      case 2: this.mode='Light';
        break;
      case 3: this.mode='Door';
        break;
      case 4: this.mode='Move';
        break;
      case 5: this.mode='Reed switch';
        break;
      default: this.mode='Unknown mode {'+mode+'}';
  }
  
  switch (frameType){
      case 0: this.frameType = "Classic";
        break;
      case 1: this.frameType = "Button";
        break;
      case 2: this.frameType = "Alert";
        break;
      case 3: this.frameType = "New Mode";
        break;
      default: this.frameType = "Unknown {"+frameType+"}";
  }
};
SIGFOXMsg.prototype.getBattery = function(){
  //MSB : first byte's last bit
  var MSB = this.bytes[0] >> 7;
  //LSB : second byte's trailing 4 bits
  var LSB = this.bytes[1] >> 4;
  
  //console.log("Battery", MSB, LSB, MSB ? LSB*16 : LSB);
  
  this.battery =(((MSB*16)+LSB) + 54) / 20;
  
  
};
SIGFOXMsg.prototype.getValues = function(){
  this.getTemperatureLowPrecision();
  
  switch(this.mode){
      case 'Temperature':
        if (this.frameType !== 'Alert'){
          this.getHumidity();
        }
        this.getTemperature();
        
        break;
  }
};
SIGFOXMsg.prototype.getTemperatureLowPrecision = function(){
  //Last 4 bits of byte 2
  var temp = this.bytes[1] & 0b1111;
  
  this.temperatureLP = (temp * 64 -200)/10;
  
};
SIGFOXMsg.prototype.getTemperature = function(){
  //MSB : First 4 bits of byte 2
  
  var MSB = Number(this.bytes[1] >> 4).toString(2);
  //console.log('temp MSB %s - %s', MSB,parseInt(MSB,2));
  
  //LSB : 6 last bits of byte 3
  var LSB = Number(this.bytes[2] & 0b111111, 2).toString(2);
  while (LSB.length < 6){
    LSB = '0'+LSB;
  }
  //console.log('temp LSB %s - %s', LSB, parseInt(LSB,2));
  //console.log('temperature', MSB+LSB, parseInt(MSB+LSB, 2));
  
  this.temperature = (parseInt(MSB+LSB,2)-200) / 8;

  
};

SIGFOXMsg.prototype.getHumidity = function(){
  this.humidity = this.bytes[3] / 2;
};

module.exports = {
  getMessages:function(id){
    
    return new Promise(function(resolve, reject){
      request.get({
        uri: 'https://backend.sigfox.com/api/devices/'+id+'/messages',
        json:true,
        auth:{
          user: process.env.SIGFOX_USERNAME,
          pass: process.env.SIGFOX_PASSWORD
        }
      })
      .then(function(messages){
        if (!messages || !messages.data || !messages.data.length){
          return reject(new Error('No messages'));
        }
        
        var output = [];
        messages.data.forEach(function(item){output.push(new SIGFOXMsg(item));});
        resolve(output);
      })
      .catch(reject);
    });
  },
  getOfflineMessages:function(){
    var messages = require('./offlineMessages.json');
    var output = [];
    messages.data.forEach(function(item){output.push(new SIGFOXMsg(item));});
    return output;
    
  }
  
};