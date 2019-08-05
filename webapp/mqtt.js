var ip = "192.168.29.3";
var port = "9001";
var usessl = false;
var id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
var username = '';
var password = '';
var message, client;
var connected = false;
var widgetRepository = {}; //property names are datastreams(keys), values are widget objects

function CreateWidget(config) {
    var datastream = config.datastream;
    if(Array.isArray(datastream)) {
        datastream.forEach(function (element) {
            widgetRepository.hasOwnProperty(element) ? console.log("Duplicate Datastream: " + element) : (widgetRepository[element] = config);
            //widgetRepository[element] = config;
        })
    } else if (typeof datastream === 'string' || datastream instanceof String){
        widgetRepository.hasOwnProperty(datastream) ? console.log("Duplicate Datastream: " + datastream) : (widgetRepository[config.datastream] = config);
        //widgetRepository[config.datastream] = config;
    }
}

function RenderWidgets() {
    connectMQTT();
}

function printwidgetRepository() {
    for (var widgetKey in widgetRepository) {
        console.log("widgetKey: " + widgetKey);
        if (widgetRepository.hasOwnProperty(widgetKey)) {
            for (var widgetprop in widgetRepository[widgetKey]) {
                if (widgetRepository[widgetKey].hasOwnProperty(widgetprop)) {
                   console.log(widgetprop + ': ' + widgetRepository[widgetKey][widgetprop]);
                }
            }
        }
    }
}

function connectMQTT() {
    client = new Paho.MQTT.Client(ip, Number(port), id);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived.bind(this);
    client.connect({
        useSSL: usessl,
        onSuccess: onConnect
    });
}

function onConnect() {
    console.log("Connected to server");   
  client.subscribe("Moisture");
  message = new Paho.MQTT.Message("Hello");
  message.destinationName = "Moisture";
  client.send(message);
    //each key is a datastream which is subscribed
    Object.keys(widgetRepository).forEach(function(datastream,index) {
        client.subscribe(datastream, {
            qos: 0
        });
    });
}

function onMessageArrived(message) {
    try {
        console.log("Recieved Message from server");
        var value = message.payloadString;
        var datastream = message.destinationName;
        console.log("datastream: " + datastream + ", value: " + value);
    } catch (e) {
        console.log("exception in onMessageArrived: " + e);
        return false;
    }
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}


$(function() {

   
});
