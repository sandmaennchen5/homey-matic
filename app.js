'use strict';

const Homey = require('homey');
const HomeMaticDiscovery = require('./lib/HomeMaticDiscovery');
const HomeMaticCCUJack = require('./lib/HomeMaticCCUJack'); 
const Constants = require('./lib/constants');
const Logger = require('./lib/logger');

const connTypeCCUJack = 'use_ccu_jack';

class Homematic extends Homey.App {
    async onInit() {
        this.logger = new Logger(this.homey);
        this.logger.log('info', 'Started homematic...');

        try {
            const address = await this.homey.cloud.getLocalAddress();
            this.homeyIP = address.split(':')[0];
            this.settings = this.getSettings();
            this.discovery = new HomeMaticDiscovery(this.logger, this.homey);
            this.bridges = {};

            const storedBridges = this.getStoredBridges();
            if (Object.keys(storedBridges).length > 0) {
                this.logger.log('info', 'Initializing stored bridges...');
                await this.initializeStoredBridges(storedBridges);
            } else {
                await this.discovery.discover();
            }
        } catch (err) {
            this.logger.log('error', 'Initialization failed:', err);
        }
    }

    async onUninit() {
        this.logger.log('info', 'Unloading homematic app...');

        const cleanupPromises = Object.values(this.bridges).map(bridge => bridge.stop?.());
        
        await Promise.all(cleanupPromises);

        this.logger.log('info', 'All bridges cleaned up.');
    }

    getSettings() {
        return {
            "ccu_jack_mqtt_port": this.homey.settings.get('ccu_jack_mqtt_port'),
            "ccu_jack_user": this.homey.settings.get('ccu_jack_user'),
            "ccu_jack_password": this.homey.settings.get('ccu_jack_password'),
            "use_stored_bridges": this.homey.settings.get('use_stored_bridges'),
        };
    }

    getStoredBridges() {
        const bridges = {};
        this.homey.settings.getKeys().forEach((key) => {
            if (key.startsWith(Constants.SETTINGS_PREFIX_BRIDGE)) {
                const bridge = this.homey.settings.get(key);
                bridges[bridge.serial] = bridge;
            }
        });
        return bridges;
    }

    async initializeStoredBridges(bridges) {
        for (const serial of Object.keys(bridges)) {
            const bridge = bridges[serial];
            this.logger.log('info', "Initializing stored CCU:", "Type", bridge.type, "Serial", bridge.serial, "IP", bridge.address);
            await this.initializeBridge(bridge);
        }
    }

    getConnectionType() {
        return connTypeCCUJack;
    }

    async initializeBridge(bridge) {
        try {
            const connType = this.getConnectionType();
            this.logger.log('info', 'Connection type:', connType);
            this.logger.log('info', 'Initializing CCU Jack');

            const bridgeInstance = new HomeMaticCCUJack({
                logger: this.logger,
                homey: this.homey,
                type: bridge.type,
                serial: bridge.serial,
                ccuIP: bridge.address,
                mqttPort: this.settings.ccu_jack_mqtt_port,
                user: this.settings.ccu_jack_user,
                password: this.settings.ccu_jack_password,
            });

            await bridgeInstance.start(); // 🔥 new lifecycle start

            this.bridges[bridge.serial] = bridgeInstance;
            this.logger.log('info', `Bridge found: ${bridge.Serial}`);
            return bridgeInstance;
        } catch (err) {
            this.logger.log('error', `Failed to initialize bridge ${bridge.serial}:`, err);
        }
    }


    setBridgeAddress(serial, address) {
        const bridge = this.bridges[serial];
        if (bridge) {
            bridge.address = address;
        } else {
            this.logger.log('error', `No bridge found for serial: ${serial}`);
        }
    }

    deleteStoredBridges() {
        const bridges = this.getStoredBridges();
        bridges.forEach((serial) => {
            this.homey.settings.unset(Constants.SETTINGS_PREFIX_BRIDGE + serial);
        });
    }

    getLogLines() {
        return this.logger.getLogLines();
    }
}

module.exports = Homematic;
