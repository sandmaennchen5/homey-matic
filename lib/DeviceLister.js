'use strict';

class DeviceLister {
  constructor(driver) {
    this.driver = driver;
  }

  async onListDevices(data, currentBridge) {
    if (!currentBridge) {
      return this.onListDevicesBridges();
    }
    return this.onListDevicesDevices(currentBridge);
  }

  async onListDevicesBridges() {
    try {
      await this.driver.homey.app.discovery.discover();
      return Object.values(this.driver.homey.app.bridges).map(bridge => ({
        name: `CCU(${bridge.ccuIP})`,
        data: {
          serial: bridge.serial,
        }
      }));
    } catch (err) {
      this.driver.logger.log('error', 'Discovery failed:', err);
      throw new Error('Discovery failed');
    }
  }

  async onListDevicesDevices(currentBridge) {
    if (!currentBridge) {
      throw new Error('Missing Bridge');
    }

    try {
      const devices = [];
      const bridgeDevices = await currentBridge.listDevices();
      for (const [interfaceName, interfaceDevices] of Object.entries(bridgeDevices)) {
        interfaceDevices.forEach(device => {
          if (this.driver.homematicTypes.includes(device.TYPE)) {
            for (let idx = 0; idx < this.driver.numDevices; idx++) {
              const deviceObj = {
                name: this.driver.getDeviceName(device.ADDRESS, idx),
                capabilities: this.driver.capabilities,
                data: {
                  id: device.ADDRESS,
                  attributes: {
                    HomeyInterfaceName: interfaceName,
                    bridgeSerial: currentBridge.serial
                  }
                }
              };
              if (this.driver.multiDevice) {
                deviceObj.data.attributes.Index = idx;
              }
              devices.push(deviceObj);
            }
          }
        });
      }
      return devices;
    } catch (err) {
      this.driver.logger.log('error', 'Failed to list devices:', err);
      throw new Error('Failed to list devices: ' + err.message);
    }
  }
}

module.exports = DeviceLister;
