/* Parse WeatherBeacon advertisements */

var parse_advertisement = function (advertisement, cb) {

    //if (advertisement.localName === 'WeatherBeacon-A88B') {
        if (advertisement.manufacturerData) {
            // Need at least 3 bytes. Two for manufacturer identifier and
            // one for the service ID.
            if (advertisement.manufacturerData.length >= 3) {
                // Check that manufacturer ID and service byte are correct
                var manufacturer_id = advertisement.manufacturerData.readUIntLE(0, 2);
                var service_id = advertisement.manufacturerData.readUInt8(2);
                //if (manufacturer_id == 0x02E0 && service_id == 0x12) {
                    // OK! This looks like a BLEES packet
                    if (advertisement.manufacturerData.length >= 4) {
                        var sensor_data = advertisement.manufacturerData.slice(0,4);
	        
	        var sensorRH = sensor_data.readUIntLE(0,2); //mandata[0] * 256 + mandata[1];
	        var sensorTEMP = sensor_data.readUIntLE(2,2); //mandata[2] * 256 + mandata[3];
	        
	        var temp = -46.85 + (175.72 * (sensorTemp / 65536));
	        var humidity = -6 + (125 * (sensorRH/65536));	                           
                        var out = {
                            device: 'WeatherBeacon',
                            humidity_percent: humidity,
                            temperature_celcius: temp,                            
                            sequence_number: sequence_num,
                        };

                        cb(out);
                        return;
                    }
                //}
            }
        }
    //}

    cb(null);
}


module.exports = {
    parseAdvertisement: parse_advertisement
};
