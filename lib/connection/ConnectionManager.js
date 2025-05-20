const EventEmitter = require('events');
const RpcHandler = require('./RpcHandler');
const DiscoveryService = require('./DiscoveryService');
const logger = require('../logger');
const CapabilityManager = require('../CapabilityManager');

class ConnectionManager extends EventEmitter {
  constructor() {
    super();
    this.initialized = false;
    this.discovery = new DiscoveryService();
    this.rpc = new RpcHandler();
    this.devices = new Map();
    this.capabilityManager = new CapabilityManager();
  }

  async init() {
    if (this.initialized) return;

    logger.info('[ConnectionManager] Initializing connection');

    try {
      await this.discovery.init();

      const interfaces = this.discovery.getInterfaces();
      const devices = await this.discovery.getDevices();

      for (const iface of interfaces) {
        await this.rpc.listen(iface, event => this.handleEvent(event));
      }

      for (const device of devices) {
        this.registerDevice(device);
      }

      this.initialized = true;
      logger.info(`[ConnectionManager] Initialized with ${devices.length} devices`);
      this.emit('ready');
    } catch (err) {
      logger.error('[ConnectionManager] Failed to initialize:', err);
      this.emit('error', err);
    }
  }

  async shutdown() {
    await this.rpc.shutdown();
    this.initialized = false;
    logger.info('[ConnectionManager] Shutdown complete');
  }

  getDeviceByAddress(address) {
    return this.devices.get(address);
  }

  registerDevice(device) {
    this.devices.set(device.address, device);
    this.capabilityManager.registerCapabilities(device);
    logger.debug(`[ConnectionManager] Registered device ${device.address}`);
  }

  handleEvent(event) {
    const device = this.devices.get(event.address);
    if (!device) {
      logger.warn(`[ConnectionManager] Received event for unknown device: ${event.address}`);
      return;
    }

    this.capabilityManager.handleEvent(device, event);
    this.emit('deviceEvent', { device, event });
  }
}

module.exports = ConnectionManager;
