'use strict';

const Homey = require('homey');
const CapabilityManager = require('./CapabilityManager');

class Device extends Homey.Device {

  async onInit(capabilityMap) {
    this.logger = this.homey.app.logger;
    this.capabilityMap = capabilityMap;
    this.deviceAddress = this.getData().id;
    this.HomeyInterfaceName = this.getData().attributes.HomeyInterfaceName;
    this.bridgeSerial = this.getSetting('ccuSerial') || this.getData().attributes.bridgeSerial;
    this.addedEvents = [];

    try {
      this.bridge = await this.driver.getBridge({ serial: this.bridgeSerial });
      this.logger.log('info', `Bridge found: ${this.bridgeSerial}`);

      this.capabilityManager = new CapabilityManager(this, this.capabilityMap);
      await this.capabilityManager.initializeCapabilities();
      this.capabilityManager.registerCapabilityListeners();

      for (const capability of Object.values(this.capabilityMap)) {
        const { channel, key } = capability;
        this.bridge.subscribeToDeviceEvent(
          this.deviceAddress,
          channel,
          key,
          value => this.capabilityManager.handleCapabilityUpdate(channel, key, value)
        );
      }

      await this.setSettings({
        address: this.deviceAddress,
        ccuIP: this.bridge.ccuIP,
        ccuSerial: this.bridge.serial,
        driver: this.driver.manifest.id,
      });
    } catch (err) {
      this.logger.log('error', 'Failed to initialize device:', err);
      this.setUnavailable('Failed to initialize device');
    }
  }

  onDeleted() {
    for (const eventName of this.addedEvents) {
      this.bridge.removeAllListeners(eventName);
    }
    this.logger.log('info', `Removed all event listeners for device: ${this.deviceAddress}`);
  }

  async setValue(channel, key, value) {
    try {
      await this.bridge.setValue(this.HomeyInterfaceName, `${this.deviceAddress}:${channel}`, key, value);
      this.logger.log('info', `Set ${key} succeeded for device - Value: ${value}, Device: ${this.deviceAddress}`);
    } catch (err) {
      this.logger.log('error', `Set ${key} failed for device - Value: ${value}, Device: ${this.deviceAddress}`, err);
      throw new Error('Failed to set value');
    }
  }
}

module.exports = Device;
