'use strict';

const EventEmitter = require('events');
const axios = require('axios');
const mqtt = require('mqtt');
const Constants = require('./constants.js');

const mqttStatusPrefix = 'device/status/';

class HomeMaticCCUJack extends EventEmitter {
  constructor({ logger, homey, type, serial, ccuIP, mqttPort, user, password }) {
    super();
    this.homey = homey;
    this.logger = logger;
    this.ccuIP = ccuIP;
    this.mqttPort = mqttPort;
    this.type = type;
    this.serial = serial;
    this.user = user;
    this.password = password;

    this.transport = Constants.TRANSPORT_MQTT;
    this.homeyIP = homey.app.homeyIP;

    this.subscribedTopics = new Set();
    this.connected = false;
    this.mqttReconnectInterval = 5000;
    this.listeners = new Map(); // eventName -> callback[]

    this.requestQueue = [];
    this.isProcessingQueue = false;

    this.jackClient = this.createJackClient();
  }

  createJackClient() {
    return axios.create({
      baseURL: `http://${this.ccuIP}:2121/`,
      timeout: 10000,
      auth: this.user && this.password ? { username: this.user, password: this.password } : undefined,
    });
  }

  async start() {
    this.setupMqtt();
  }

  setupMqtt() {
    const options = this.user && this.password ? { username: this.user, password: this.password } : {};
    this.MQTTClient = mqtt.connect(`mqtt://${this.ccuIP}:${this.mqttPort}`, options);

    this.MQTTClient.on('connect', () => {
      this.logger.log('info', `Connected to CCU Jack broker at: ${this.ccuIP}:${this.mqttPort}`);
      this.connected = true;
      this.subscribedTopics.forEach(topic => this.MQTTClient.subscribe(topic));
    });

    this.MQTTClient.on('message', (topic, message) => this._handleMessage(topic, message));
    this.MQTTClient.on('close', () => this._handleDisconnect('MQTT disconnected'));
    this.MQTTClient.on('offline', () => this._handleDisconnect('MQTT went offline'));
    this.MQTTClient.on('error', err => this._handleDisconnect(`MQTT connection error: ${err.message}`));
  }

  _handleMessage(topic, message) {
    if (!topic.startsWith(mqttStatusPrefix)) return;

    const devTopic = topic.replace(mqttStatusPrefix, '');
    const parts = devTopic.split('/');
    if (parts.length !== 3) {
      this.logger.log('error', 'Malformed MQTT message', topic);
      return;
    }

    const [address, channel, datapoint] = parts;
    const value = JSON.parse(message.toString())?.v;
    const eventName = this._formatEventName(address, channel, datapoint);

    this.emit('deviceUpdate', {
      address,
      channel,
      datapoint,
      value,
    });

    // Notify direct listeners
    const callbacks = this.listeners.get(eventName);
    if (callbacks) callbacks.forEach(cb => cb(value));
  }

  _handleDisconnect(msg) {
    this.logger.log('warn', msg);
    this.connected = false;

    setTimeout(() => this.setupMqtt(), this.mqttReconnectInterval);
  }

  _formatEventName(address, channel, datapoint) {
    return `${address}:${channel}-${datapoint}`;
  }

  subscribeToDeviceEvent(address, channel, datapoint, callback) {
    const eventName = this._formatEventName(address, channel, datapoint);

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName).push(callback);

    const topic = `${mqttStatusPrefix}${address.replace(':', '/')}/${channel}/${datapoint}`;
    if (!this.subscribedTopics.has(topic)) {
      this.subscribedTopics.add(topic);
      if (this.connected) {
        this.MQTTClient.subscribe(topic, err => {
          if (err) this.logger.log('error', `Failed to subscribe to ${topic}`, err);
          else this.logger.log('info', `Subscribed to topic ${topic}`);
        });
      }
    }
  }

  enqueueRequest(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;
    try {
      while (this.requestQueue.length > 0) {
        const batch = this.requestQueue.splice(0, 10);
        await Promise.all(batch.map(req => req()));
      }
    } catch (err) {
      this.logger.log('error', 'Failed processing request queue', err);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  async listDevices() {
    const response = await this.enqueueRequest(() => this.jackClient.get('device'));
    const links = response.data['~links'];

    const devices = await Promise.all(
      links.map(link => this.jackClient.get(`device/${link.href}`))
    );

    return devices.reduce((acc, { data }) => {
      const { type, address, interfaceType } = data;
      if (!acc[interfaceType]) acc[interfaceType] = [];
      acc[interfaceType].push({ TYPE: type, ADDRESS: address });
      return acc;
    }, {});
  }

  async getValue(interfaceName, address, key) {
    const valueURL = `device/${address.replace(':', '/')}/${key}/~pv`;
    const response = await this.enqueueRequest(() => this.jackClient.get(valueURL));
    return response.data.v;
  }

  async setValue(interfaceName, address, key, value) {
    const adjusted = value === '1.0' ? 1 : value === '0.0' ? 0 : value;
    const topic = `device/set/${address.replace(':', '/')}/${key}`;

    await this.enqueueRequest(() => new Promise((resolve, reject) => {
      this.MQTTClient.publish(topic, JSON.stringify(adjusted), err => {
        if (err) {
          this.logger.log('error', `MQTT publish failed for ${topic}`, err);
          return reject(err);
        }
        resolve();
      });
    }));
  }

  async stop() {
    if (this.MQTTClient) {
      this.MQTTClient.end(true, () => {
        this.logger.log('info', 'MQTT client disconnected');
      });
    }

    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.subscribedTopics.clear();
    this.listeners.clear();
    this.connected = false;
  }
}

module.exports = HomeMaticCCUJack;
