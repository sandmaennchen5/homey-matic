'use strict';

const Homey = require('homey');
const DeviceLister = require('./DeviceLister');

class Driver extends Homey.Driver {

  onInit() {
    this.logger = this.homey.app.logger;
    this.multiDevice = false;
    this.numDevices = 1;
    this.deviceLister = new DeviceLister(this, this.logger);
  }

  getDeviceName(address, idx) {
    return this.multiDevice ? `${address}-${idx + 1}` : address;
  }

  async getBridge({ serial }) {
    const bridges = this.homey.app.bridges;

    if (!serial && Object.keys(bridges).length > 0) {
      return bridges[Object.keys(bridges)[0]];
    }

    if (bridges[serial]) {
      return bridges[serial];
    }

    try {
      await this.homey.app.discovery.discover();
    } catch (err) {
      this.homey.app.logger.log('error', 'Bridge discovery failed:', err);
      throw new Error('Bridge discovery failed');
    }

    if (!serial && Object.keys(bridges).length > 0) {
      return bridges[Object.keys(bridges)[0]];
    }

    if (bridges[serial]) {
      return bridges[serial];
    }

    throw new Error('Bridge not found');
  }

  async onPair(session) {
    let currentBridge;
    const self = this;

    session.setHandler('list_devices', async (data) => {
      try {
        return await self.deviceLister.onListDevices(currentBridge);
      } catch (err) {
        self.homey.app.logger.log('error', 'driver.onPair() Failed to list devices during pairing:', err);
        throw err;
      }
    });

    session.setHandler('list_bridges_selection', (data) => {
      currentBridge = self.homey.app.bridges[data[0].data.serial];
    });
  }
}

module.exports = Driver;
