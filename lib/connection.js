/*global module:true, require:false*/

const EventEmitter = require('events');
const freeport = require('freeport');
const Homey = require('homey');

class InterfaceConnection extends EventEmitter {

  constructor(logger, interfaceName, config) {
    super();
    this.logger = logger;
    this.interfaceName = interfaceName;
    this._settings = config;
    this.failureCount = 0;
    this.maxFailureCount = 10;
    this.deactivated = false;
    this.connected = false;
    this.wasConnected = false;
    this.reconnectInterval = 10000;
    this.retrying = false;

    this.init();
  }

  async init() {
    try {
      this.port = await this.getFreePort();
      await this.initRpcServerAndClient(this.port);
    } catch (err) {
      this.logger.log('error', 'Failed to initialize:', err);
      throw err;
    }
  }

  getFreePort() {
    return new Promise((resolve, reject) => {
      freeport((err, port) => {
        if (err) {
          reject(err);
        } else {
          resolve(port);
        }
      });
    });
  }

  getInitUrl() {
    return `${this._settings.protocol}://${this._settings.homeyIP}:${this.port}`;
  }

  retryConnect() {
    this.logger.log('info', "Check retry: ", this.interfaceName);
    if (this.failureCount > this.maxFailureCount && !this.wasConnected) {
      this.logger.log('info', "Giving up on ", this.interfaceName);
      clearInterval(this.retryConnectTimer);
      this.retrying = false;
      return;
    }
    if (!this.connected) {
      this.logger.log('info', "Reconnecting to ", this.interfaceName);
      this.failureCount += 1;
      let backoffTime = Math.min(this.failureCount * this.reconnectInterval, 60000); // Cap at 60 seconds
      setTimeout(() => this.initInterface(), backoffTime);
    }
  }

  async initRpcServerAndClient(port) {
    this.createRpcServer(port);
    this.rpcClient = this.createRpcClient();
    await this.initInterface();
  }

  createRpcServer(port) {
    this.rpcServer = this._settings.rpc.createServer({ host: this._settings.homeyIP, port });

    this.rpcServer.on('system.listMethods', (err, params, callback) => {
      callback(null, ['system.listMethods', 'system.multicall', 'event', 'listDevices']);
    });

    this.rpcServer.on('listDevices', (err, params, callback) => {
      callback(null, []);
    });

    this.rpcServer.on('event', (err, params, callback) => {
      this.emitEvent(params);
      callback(null, '');
    });

    this.rpcServer.on('system.multicall', (err, params, callback) => {
      params[0].forEach(call => {
        if (call.methodName === 'event') {
          this.emitEvent(call.params);
        }
      });
      callback(null, '');
    });
  }

  createRpcClient() {
    return this._settings.rpc.createClient({ host: this._settings.ccuIP, port: this._settings.port });
  }

  emitEvent(event) {
    if (event && event.length === 4) {
      const eventName = `event-${event[1]}-${event[2]}`;
      this.emit('event', {
        name: eventName,
        value: event[3]
      });
    }
    this.lastEvent = now();
  }

  async initInterface() {
    try {
      const res = await this.rpcClient.methodCallAsync('init', [this.getInitUrl(), `homey_${this.interfaceName}`]);
      this.logger.log('info', "Connected to", this.interfaceName);
      this.failureCount = 0;
      this.connected = true;
      this.wasConnected = true;
      this.retrying = false;
      clearInterval(this.retryConnectTimer);
      this.lastEvent = now();
      this.checkConnection();
    } catch (err) {
      this.logger.log('info', "Failed to connect:", this.interfaceName, err);
      this.connected = false;
      if (!this.retrying) {
        this.retrying = true;
        this.retryConnectTimer = setInterval(() => this.retryConnect(), this.reconnectInterval);
      }
    }
  }

  checkConnection() {
    clearTimeout(this.rpcPingTimer);
    const pingTimeout = this._settings.pingTimeout;
    const elapsed = Math.round((now() - this.lastEvent) / 1000);

    if (elapsed > pingTimeout) {
      this.logger.log('info', 'ping timeout', this.interfaceName, elapsed);
      this.initInterface();
      return;
    }
    if (elapsed >= (pingTimeout / 2)) {
      this.logger.log('info', "Sending ping to ", this.interfaceName);
      this.rpcClient.methodCall('ping', ['homey'], (err, res) => { });
    }
    this.rpcPingTimer = setTimeout(() => this.checkConnection(), pingTimeout * 250);
  }

  async listDevices() {
    if (!this.connected) {
      return { 'interfaceName': this.interfaceName, 'devices': [] };
    }
    try {
      const res = await this.rpcClient.methodCallAsync('listDevices', []);
      const devices = res.map(device => {
        device.HomeyInterfaceName = this.interfaceName;
        return device;
      });
      return { 'interfaceName': this.interfaceName, 'devices': devices };
    } catch (err) {
      throw err;
    }
  }

  async getValue(address, key) {
    try {
      const res = await this.rpcClient.methodCallAsync('getValue', [address, key]);
      return res;
    } catch (err) {
      throw err;
    }
  }

  async setValue(address, key, value) {
    try {
      const res = await this.rpcClient.methodCallAsync('setValue', [address, key, value]);
      return res;
    } catch (err) {
      throw err;
    }
  }

  cleanup() {
    if (this.rpcClient) {
      this.rpcClient.methodCall('init', [this.getInitUrl(), ''], (err, res) => {
        if (err) {
          this.logger.log('error', 'Failed to cleanup RPC client:', err);
        }
      });
    }
    if (this.rpcServer) {
      this.rpcServer.close(() => {
        this.logger.log('info', 'RPC server closed');
      });
    }
    clearTimeout(this.rpcPingTimer);
    clearInterval(this.retryConnectTimer);
  }
}

function now() {
  return (new Date()).getTime();
}

module.exports = InterfaceConnection;
