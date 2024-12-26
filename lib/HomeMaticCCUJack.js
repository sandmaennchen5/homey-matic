'use strict';

const EventEmitter = require('events');
const axios = require('axios');
const mqtt = require('mqtt');
const Constants = require('./constants.js');

const mqttStatusPrefix = 'device/status/';

class HomeMaticCCUJack extends EventEmitter {
  constructor(logger, homey, type, serial, ccuIP, mqttPort, user, password) {
    super();
    this.homey = homey;
    this.logger = logger;
    this.ccuIP = ccuIP;
    this.mqttPort = mqttPort;
    this.type = type;
    this.transport = Constants.TRANSPORT_MQTT;
    this.serial = serial;
    this.homeyIP = this.homey.app.homeyIP;
    this.subscribedTopics = [];
    this.connected = false;
    this.mqttReconnectInterval = 5000;

    this.setupMqtt(user, password);
    this.jackClient = this.createJackClient(ccuIP, user, password);
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  createJackClient(ccuIP, user, password) {
    const clientOptions = {
      baseURL: `http://${ccuIP}:2121/`,
      timeout: 10000,
      auth: user && password ? { username: user, password: password } : undefined,
    };
    return axios.create(clientOptions);
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
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    try {
      while (this.requestQueue.length > 0) {
        const requestBatch = this.requestQueue.splice(0, 10);
        await Promise.all(requestBatch.map(req => req()));
      }
    } catch (error) {
      this.logger.log('error', 'Failed to process request batch:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  subscribeTopic(name) {
    this.enqueueRequest(() => 
      new Promise((resolve, reject) => {
        this.MQTTClient.subscribe(name, (err) => {
          if (err) {
            this.logger.log('error', 'Failed to subscribe to topic', name, err);
            return reject(err);
          }
          this.logger.log('info', 'Subscribed to topic', name);
          resolve();
        });
      })
    );
  }

  setupMqtt(user, password) {
    const options = user && password ? { username: user, password: password } : {};
    this.MQTTClient = mqtt.connect(`mqtt://${this.ccuIP}:${this.mqttPort}`, options);

    this.MQTTClient.on('connect', () => {
      this.logger.log('info', `Connected to CCU Jack broker at: ${this.ccuIP}:${this.mqttPort}`);
      this.connected = true;
      this.subscribedTopics.forEach(topic => this.subscribeTopic(topic));
    });

    this.MQTTClient.on('message', (topic, message) => {
      if (topic.startsWith(mqttStatusPrefix)) {
        const devTopic = topic.replace(mqttStatusPrefix, '');
        const parts = devTopic.split('/');
        if (parts.length !== 3) {
          this.logger.log('error', 'Received malformed message', topic, devTopic, parts);
          return;
        }
        const [address, channel, datapoint] = parts;
        const msg = JSON.parse(message.toString());
        const eventName = this.getEventName(address, channel, datapoint);
        this.emit(eventName, msg.v);
      }
    });

    this.MQTTClient.on('close', () => {
      this.logger.log('info', 'MQTT disconnected');
      this.connected = false;
      setTimeout(() => this.setupMqtt(user, password), this.mqttReconnectInterval);
    });

    this.MQTTClient.on('offline', () => {
      this.logger.log('info', 'MQTT went offline');
      this.connected = false;
      setTimeout(() => this.setupMqtt(user, password), this.mqttReconnectInterval);
    });

    this.MQTTClient.on('error', (err) => {
      this.logger.log('error', 'MQTT connection error:', err);
      this.connected = false;
      setTimeout(() => this.setupMqtt(user, password), this.mqttReconnectInterval);
    });
  }

  getEventName(address, channel, datapoint) {
    return `event-${address}:${channel}-${datapoint}`;
  }

  on(event, callback) {
    super.on(event, callback);

    const prefix = 'event-';
    if (event.startsWith(prefix)) {
      const tmp = event.replace(prefix, '');
      let [channel, datapoint] = tmp.split('-');
      channel = channel.replace(':', '/');
      const topic = `${mqttStatusPrefix}${channel}/${datapoint}`;
      if (!this.subscribedTopics.includes(topic)) {
        this.subscribedTopics.push(topic);
      }
      if (this.connected) {
        this.subscribeTopic(topic);
      }
    }
  }

  async listDevices() {
    try {
      const response = await this.enqueueRequest(() => this.jackClient.get('device'));
      const deviceLinks = response.data['~links'];
      const devices = await Promise.all(deviceLinks.map(link => this.jackClient.get(`device/${link.href}`)));
      const deviceMap = devices.reduce((acc, dev) => {
        const device = dev.data;
        if (!acc[device.interfaceType]) {
          acc[device.interfaceType] = [];
        }
        acc[device.interfaceType].push({
          TYPE: device.type,
          ADDRESS: device.address,
        });
        return acc;
      }, {});
      return deviceMap;
    } catch (err) {
      this.logger.log('error', 'HomeMaticCCUJack.listDevices() Failed to list devices:', err);
      throw err;
    }
  }

  async getValue(interfaceName, address, key) {
    try {
      const valueURL = `device/${address.replace(':', '/')}/${key}/~pv`;
      const response = await this.enqueueRequest(() => this.jackClient.get(valueURL));
      return response.data.v;
    } catch (err) {
      this.logger.log('error', `Failed to get device value for ${address} ${key}:`, err);
      throw new Error('Failed to get value');
    }
  }

  async setValue(interfaceName, address, key, value) {
    let myValue = value === '1.0' ? 1 : value === '0.0' ? 0 : value;
    try {
      await this.enqueueRequest(() =>
        new Promise((resolve, reject) => {
          this.MQTTClient.publish(
            `device/set/${address.replace(':', '/')}/${key}`,
            JSON.stringify(myValue),
            (err) => {
              if (err) {
                this.logger.log('error', 'Failed to publish message:', err);
                return reject(new Error('Failed to set value'));
              }
              resolve();
            }
          );
        })
      );
    } catch (err) {
      this.logger.log('error', `Failed to set value for ${address} ${key}:`, err);
      throw err;
    }
  }

  cleanup() {
    if (this.MQTTClient) {
      this.MQTTClient.end(true, () => {
        this.logger.log('info', 'MQTT client disconnected');
      });
    }
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }
}

module.exports = HomeMaticCCUJack;
