const HomeMaticDiscovery = require('../HomeMaticDiscovery');
const DeviceLister = require('../DeviceLister');
const logger = require('../logger');

class DiscoveryService {
  constructor() {
    this.discovery = new HomeMaticDiscovery();
    this.interfaces = [];
    this.devices = [];
  }

  async init() {
    logger.info('[DiscoveryService] Starting discovery');

    this.interfaces = await this.discovery.discoverInterfaces();
    this.devices = await DeviceLister.getAllDevices();

    logger.info(`[DiscoveryService] Found ${this.devices.length} devices`);
  }

  getInterfaces() {
    return this.interfaces;
  }

  getDevices() {
    return this.devices;
  }
}

module.exports = DiscoveryService;
