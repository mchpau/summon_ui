/* JavaScript for ESS Summon UI */

var last_update = 0;

// Load the swipe pane
$(document).on('pageinit',function(){
        document.querySelector("#tempvalue").innerHTML = "NA";
        document.querySelector("#tempvalue").className = "0";
        document.querySelector("#rhvalue").innerHTML = "NA";
        document.querySelector("#rhvalue").className = "0";
    });
});

var app = {
    // Application Constructor
    initialize: function() {
        app.log("init");
        document.addEventListener("deviceready", app.onAppReady, false);
        document.addEventListener("resume", app.onAppReady, false);
        document.addEventListener("pause", app.onPause, false);
    },
    // App Ready Event Handler
    onAppReady: function() {
        app.log("onAppReady");

        // Setup update for last data time
        setInterval(app.update_time_ago, 5000);
        app.log("Checking if ble is enabled...");
        summon.bluetooth.isEnabled(app.onEnable);                                                // if BLE enabled, goto: onEnable
        // app.onEnable();
    },
    // App Paused Event Handler
    onPause: function() {
        app.log("on Pause");                                                           // if user leaves app, stop BLE
        summon.bluetooth.stopScan();
    },
    // Bluetooth Enabled Callback
    onEnable: function() {
        app.log("onEnable");
        // app.onPause();                                                              // halt any previously running BLE processes
        summon.bluetooth.startScan([], app.onDiscover, app.onAppReady);                          // start BLE scan; if device discovered, goto: onDiscover
        app.log("Searching ");
    },
    // BLE Device Discovered Callback
    onDiscover: function(device) {
        //if (device.name == "WeatherBeacon") {
            app.log("Found " + device.name + " (" + device.id + ")!");
            if (!$("#"+device.id.replace(/:/g,'')).length) $("#template").clone().attr("id",device.id.replace(/:/g,'')).appendTo(".ui-page");
            app.onParseAdvData(device);
        //}
    },
   onParseAdvData: function(device){
       deviceId = device.id.replace(/:/g,'');
        //Parse Advertised Data
        var advertisement = device.advertisement;
        $("#"+deviceId+" .devtitle")[0].innerHTML = String(device.id);
        // Check this is something we can parse
        if (advertisement.localName == 'WeatherBeacon' !== -1) {

            var mandata = advertisement.manufacturerData;
            var signedmandata = new Int16Array(advertisement.manufacturerData.buffer);

            // Save when we got this.
            last_update = Date.now();

            //app.log("Parsing advertised data...");
            var sensorRH = mandata[0] * 256 + mandata[1];
            var sensorTEMP = mandata[2] * 256 + mandata[3];
            
            var temperature_celsius = -46.85 + (175.72 * (sensorTemp / 65536));
            app.log("Temperature: " + temperature_celsius);
            var temperatureOut = temperature_celsius.toFixed(1) + String.fromCharCode(176) + "C";
            $("#"+deviceId+" .tempVal")[0].innerHTML = String(temperatureOut);
            
            var relativeHumidity = -6 + (125 * (sensorRH/65536));
            app.log("Humidity: " + relativeHumidity);
            var humidityOut = relativeHumidity.toFixed(1) + String.fromCharCode(37);
            $("#"+deviceId+" .humVal")[0].innerHTML = String(humidityOut);

            app.update_time_ago();

        } else {
            // Not a UOMBT packet...
            app.log('Advertisement was not a Weather Beacon.');
        }

    },
    update_time_ago: function () {
        summon.bluetooth.stopScan();
        summon.bluetooth.startScan([], app.onDiscover, app.onAppReady);


        // if (last_update > 0) {
        //     // Only do something after we've gotten a packet
        //     // Default output
        //     var out = 'Haven\'t gotten a packet in a while...';

        //     var now = Date.now();
        //     var diff = now - last_update;
        //     if (diff < 60000) {
        //         // less than a minute
        //         var seconds = Math.round(diff/1000);
        //         out = 'Last updated ' + seconds + ' second';
        //         if (seconds != 1) {
        //             out += 's';
        //         }
        //         out += ' ago';

        //     } else if (diff < 120000) {
        //         out = 'Last updated about a minute ago';
        //     }

        //     document.querySelector("#data_update").innerHTML = out;
        // }
    },
    // Function to Log Text to Screen
    log: function(string) {
        console.log(string);
        // document.querySelector("#console").innerHTML += (new Date()).toLocaleTimeString() + " : " + string + "<br />";
        // document.querySelector("#console").scrollTop = document.querySelector("#console").scrollHeight;
    }
};

app.initialize();
