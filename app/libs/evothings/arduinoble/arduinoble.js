// File: arduinoble.js

// Load library EasyBLE.
evothings.loadScript('libs/evothings/easyble/easyble.js');

/**
 * @namespace
 * @author Mikael Kindborg
 * @description <p>Functions for communicating with an Arduino BLE shield.</p>
 * <p>It is safe practise to call function {@link evothings.scriptsLoaded}
 * to ensure dependent libraries are loaded before calling functions
 * in this library.</p>
 *
 * @todo This is a very simple library that has only write capability,
 * read and notification functions should be added.
 *
 * @todo Add function to set the write characteristic UUID to make
 * the code more generic.
 */
evothings.arduinoble = {};

;(function()
{
	// Internal functions.
	var internal = {};

	/**
	 * Stop any ongoing scan and disconnect all devices.
	 * @public
	 */
	evothings.arduinoble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/**
	 * Called when you've connected to an Arduino BLE shield.
	 * @callback evothings.arduinoble.connectsuccess
	 * @param {evothings.arduinoble.ArduinoBLEDevice} device -
	 * The connected BLE shield.
	 */

	/**
	 * Connect to a BLE-shield.
	 * @param deviceName BLE name if the shield.
	 * @param {evothings.arduinoble.connectsuccess} success -
	 * Success callback: success(device)
	 * @param {function} fail - Error callback: fail(errorCode)
	 * @example
	 * evothings.arduinoble.connect(
	 *   'arduinoble', // Name of BLE shield.
	 *   function(device)
	 *   {
	 *     console.log('connected!');
	 *     device.writeDataArray(new Uint8Array([1]));
	 *     evothings.arduinoble.close();
	 *   },
	 *   function(errorCode)
	 *   {
	 *     console.log('Error: ' + errorCode);
	 *   });
	 * @public
	 */
	evothings.arduinoble.connect = function(deviceName, success, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				if (device.name == deviceName)
				{
					evothings.easyble.stopScan();
					internal.connectToDevice(device, success, fail);
				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Connect to the BLE shield.
	 * @private
	 */
	internal.connectToDevice = function(device, success, fail)
	{
		device.connect(
			function(device)
			{
				// Get services info.
				internal.getServices(device, success, fail);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Read all services from the device.
	 * @private
	 */
	internal.getServices = function(device, success, fail)
	{
		device.readServices(
			null, // null means read info for all services
			function(device)
			{
				internal.addMethodsToDeviceObject(device);
				success(device);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Add instance methods to the device object.
	 * @private
	 */
	internal.addMethodsToDeviceObject = function(device)
	{
		/**
		 * Object that holds info about an Arduino BLE shield.
		 * @namespace evothings.arduinoble.ArduinoBLEDevice
		 */

		/**
		 * @function writeDataArray
		 * @description Write data to an Arduino BLE shield.
		 * @param {Uint8Array} uint8array - The data to be written.
		 * @memberof evothings.arduinoble.ArduinoBLEDevice
		 * @instance
		 * @public
		 */
		device.writeDataArray = function(uint8array, uuid)
		{

			uuid = '0000fff1-0000-1000-8000-00805f9b34fb';
			console.log('writeCharacteristic ' + uint8array);
			device.writeCharacteristic(
				uuid,
				uint8array,
				function()
				{
					console.log('writeCharacteristic success');
				},
				function(errorCode)
				{
					console.log('writeCharacteristic error: ' + errorCode);
				});

		};

		device.read = function(name,state)
		{
            var value = 0;
			uuid = '0000fff2-0000-1000-8000-00805f9b34fb';
			console.log('readCharacteristic ' );
			device.readCharacteristic(

				uuid,
				function(data){
                    state.busy=false;
     				state.position = new Uint8Array(data)
					console.log('readCharacteristic success' + state.position);
				},
				function(errorCode){
                    state.busy=false;
					console.log('readCharacteristic error: ' + errorCode);
				});
            return value;
		};

		/**
		 * @function writeDataArray
		 * @description Write data to an Arduino BLE shield.
		 * @param {Uint8Array} uint8array - The data to be written.
		 * @memberof evothings.arduinoble.ArduinoBLEDevice
		 * @instance
		 * @public
		 */
		device.writeRoute = function(route, state)
		{

			uuid = '0000fff5-0000-1000-8000-00805f9b34fb';
			console.log('writeCharacteristic ' + route);
            route.push("stop");
            var loop_is_start = 0;
  			for (var i = 0; i <= route.length/10; ++i){
           /* uuid = '0000fff1-0000-1000-8000-000000000000';*/
                var write_array = new Uint8Array([0,0,0,0,0,0,0,0,0,0,0]);
                if(i==0){
                    state.wagon=0;
                }
                write_array[0] = i*10;
      			for (var j = 0; (j < 10)&&((i*10+j)<route.length); ++j){
                    if(loop_is_start){
                        loop_is_start = loop_is_start - 1;
                        write_array[j+1] = route[i*10+j];
                    }else if(route[i*10+j]=="forward"){
                        write_array[j+1] = 1;
                    }else if(route[i*10+j]=="reverse"){
                        write_array[j+1] = 2;
                    }else if(route[i*10+j]=="right"){
                        write_array[j+1] = 3;
                    }else if(route[i*10+j]=="left"){
                        write_array[j+1] = 4;
                    }else if(route[i*10+j]=="loop"){
                        write_array[j+1] = 136;
                        loop_is_start = 2;
                    }else{
                        write_array[j+1] = 0;
                    }
                }

    			console.log('write array ' + write_array);
    			device.writeCharacteristic(
				uuid,
				write_array,
				function()
				{   
					console.log('array write success wagon' + state.wagon);
                    state.wagon+=10
				},
				function(errorCode)
				{
					console.log('array write error: ' + errorCode);
				});
  			}
            route.splice(-1,1);
            var uint8array = new Uint8Array([5]);
			uuid = '0000fff1-0000-1000-8000-00805f9b34fb';
			console.log('writeCharacteristic ' + uint8array);
           /* uuid = '0000fff1-0000-1000-8000-000000000000';*/
			device.writeCharacteristic(
				uuid,
				uint8array,
				function()
				{
					console.log('writeCharacteristic success');
				},
				function(errorCode)
				{
					console.log('writeCharacteristic error: ' + errorCode);
				});



		};

	};
})();
