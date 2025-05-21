'use strict';

const dgram = require('dgram');
const Constants = require('./constants');

const DISCOVER_MESSAGE = Buffer.from([0x02, 0x8F, 0x91, 0xC0, 0x01, 'e', 'Q', '3', 0x2D, 0x2A, 0x00, 0x2A, 0x00, 0x49]);
const DISCOVER_TIMEOUT = 5000;
const CCU_PORT = 43439;
const DGRAM_PORT = 48724;

class HomeMaticDiscovery {
  constructor(logger, homey) {
    this.logger = logger;
    this.homey = homey;
    this.devices = {};
    this.discoveryInProgress = false;
    this._client = null;
  }

  async getClient() {
    if (this._client) return this._client;
    this._client = await this.createClient();
    return this._client;
  }

  createClient() {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');
      client.on('message', this._onClientMessage.bind(this));
      client.on('error', (err) => {
        this.logger.log('error', 'UDP client error:', err);
        client.close(); // Close on error
        this._client = null;
      });
      client.on('listening', () => {
        const address = client.address();
        this.logger.log('info', `UDP client listening on ${address.address}:${address.port}`);
      });
      client.bind(DGRAM_PORT, (err) => {
        if (err) {
          this.logger.log('error', 'Failed to bind UDP client:', err);
          return reject(err);
        }
        client.setBroadcast(true);
        resolve(client);
      });
    });
  }

  _onClientMessage(message, remote) {
    const { address, port } = remote;
    this.logger.log('info', `Received message from ${address}:${port}`);
    this.logger.log('info', `Raw message: ${message.toString('hex')}`);
    try {
      const { type, serial } = this.parseMessage(message);
      this.logger.log('info', `Discovered device - Type: ${type}, Serial: ${serial}, Address: ${address}`);

      if (this.homey.app.bridges[serial]) {
        this.logger.log('info', `Updating existing bridge: ${serial}`);
        this.homey.app.setBridgeAddress(serial, address);
      } else {
        this.logger.log('info', `Initializing new bridge: ${serial}`);
        this.homey.app.initializeBridge({ serial, type, address });
      }
      this.homey.settings.set(Constants.SETTINGS_PREFIX_BRIDGE + serial, { serial, type, address });
    } catch (err) {
      this.logger.log('error', `Error processing message from ${address}:`, err);
    }
  }

  parseMessage(message) {
    const headerEnd = 5;
    const typeEnd = message.indexOf(0x00, headerEnd);
    if (typeEnd === -1) throw new Error('Invalid message format: missing type');

    const type = message.slice(headerEnd, typeEnd).toString();

    const serialStart = typeEnd + 1;
    const serialEnd = message.indexOf(0x00, serialStart);
    if (serialEnd === -1) throw new Error('Invalid message format: missing serial');

    const serial = message.slice(serialStart, serialEnd).toString();

    if (!type || !serial) throw new Error('Invalid message: empty type or serial');
    return { type, serial };
  }

  async discover({ timeout = DISCOVER_TIMEOUT } = {}) {
    if (this.discoveryInProgress) {
      this.logger.log('warn', 'Discovery process already in progress, skipping...');
      return;
    }
    this.discoveryInProgress = true;
    this.logger.log('info', 'Starting discovery process...');

    let client;
    try {
      client = await this.getClient();
      await this.sendDiscoveryMessage(client);
      await new Promise(resolve => setTimeout(resolve, timeout));
      this.logger.log('info', 'Timeout elapsed, checking for discovered devices...');
    } catch (err) {
      this.logger.log('error', 'Discovery failed:', err);
    } finally {
      this.discoveryInProgress = false;
      this._closeClient();
      this.logger.log('info', 'Discovery process finished.');
    }
  }

  sendDiscoveryMessage(client) {
    return new Promise((resolve, reject) => {
      client.send(DISCOVER_MESSAGE, 0, DISCOVER_MESSAGE.length, CCU_PORT, '255.255.255.255', (err) => {
        if (err) {
          this.logger.log('error', 'Failed to send discovery message:', err);
          return reject(err);
        }
        this.logger.log('info', 'Discovery message sent');
        resolve();
      });
    });
  }

  _closeClient() {
    if (this._client) {
      try {
        this._client.close();
        this.logger.log('info', 'UDP client closed');
      } catch (err) {
        this.logger.log('warn', 'Error closing UDP client:', err);
      }
      this._client = null;
    }
  }
}

module.exports = HomeMaticDiscovery;
