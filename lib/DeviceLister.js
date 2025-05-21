'use strict';

class DeviceLister {
  constructor(driver, logger) {
    this.driver = driver;
    this.logger = logger;
  }

  async onListDevices(currentBridge) {
    if (!currentBridge) {
      this.logger.log('info', 'onListDevices invoked: no bridge, listing bridges...');
      return this.onListDevicesBridges();
    }
    this.logger.log('info', `onListDevices invoked with bridge serial: ${currentBridge.serial || 'unknown'}`);
    return this.onListDevicesDevices(currentBridge);
  }

  async onListDevicesBridges() {
    try {
      // Prevent multiple concurrent discoveries (race condition!)
      if (this.driver.homey.app.discovery.discoveryInProgress) {
        this.logger.log('warn', 'Discovery already in progress, skipping...');
        return [];
      }
      await this.driver.homey.app.discovery.discover();
      return Object.values(this.driver.homey.app.bridges).map(bridge => ({
        name: `CCU(${bridge.ccuIP})`,
        data: { serial: bridge.serial }
      }));
    } catch (err) {
      this.logger.log('error', 'Discovery failed:', err);
      throw new Error('Discovery failed');
    }
  }

  async onListDevicesDevices(currentBridge) {
    if (!currentBridge) throw new Error('Missing Bridge');
    if (!Array.isArray(this.driver.homematicTypes)) {
      this.logger.log('error', 'homematicTypes not set on driver');
      throw new Error('Driver misconfiguration');
    }
    if (!Array.isArray(this.driver.capabilities)) {
      this.logger.log('error', 'capabilities not set on driver');
      throw new Error('Driver misconfiguration');
    }
    try {
      const devices = [];
      const bridgeDevices = await currentBridge.listDevices();

      for (const [interfaceName, interfaceDevices] of Object.entries(bridgeDevices)) {
        for (const device of interfaceDevices) {
          if (this.driver.homematicTypes.includes(device.TYPE)) {
            for (let idx = 0; idx < this.driver.numDevices; idx++) {
              const deviceObj = {
                name: this.driver.getDeviceName(device.ADDRESS, idx),
                capabilities: this.driver.capabilities,
                data: {
                  id: device.ADDRESS,
                  attributes: {
                    HomeyInterfaceName: interfaceName,
                    bridgeSerial: currentBridge.serial,
                  },
                },
              };
              if (this.driver.multiDevice) {
                deviceObj.data.attributes.Index = idx;
              }
              devices.push(deviceObj);
            }
          }
        }
      }
      return devices;
    } catch (err) {
      this.logger.log('error', 'Failed to list devices:', err);
      throw new Error('DeviceLister.onListDevicesDevices() Failed to list devices: ' + err.message);
    }
  }
}

module.exports = DeviceLister;
