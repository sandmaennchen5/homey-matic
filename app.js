'use strict';

const Homey = require('homey');
const HomeMaticDiscovery = require('./lib/HomeMaticDiscovery');
const HomeMaticCCUJack = require('./lib/HomeMaticCCUJack'); // Behalten Sie nur diesen Import
const Constants = require('./lib/constants');
const Logger = require('./lib/logger');

const connTypeCCUJack = 'use_ccu_jack'; // Nur dieser Verbindungstyp bleibt bestehen

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
                this.initializeStoredBridges(storedBridges);
            } else {
                await this.discovery.discover();
            }
        } catch (err) {
            this.logger.log('error', 'Initialization failed:', err);
        }
    }

    async onUninit() {
        this.logger.log('info', 'Unloading homematic app...');

        const cleanupPromises = Object.keys(this.bridges).map(serial => {
            if (this.bridges[serial].cleanup) {
                this.bridges[serial].cleanup();
            }
        });

        // Wait for all cleanup operations to finish
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
                let bridge = this.homey.settings.get(key);
                bridges[bridge.serial] = bridge;
            }
        });
        return bridges;
    }

    initializeStoredBridges(bridges) {
        Object.keys(bridges).forEach((serial) => {
            let bridge = bridges[serial];
            this.logger.log('info', "Initializing stored CCU:", "Type", bridge.type, "Serial", bridge.serial, "IP", bridge.address);
            this.initializeBridge(bridge);
        });
    }

    getConnectionType() {
        return connTypeCCUJack;
    }

    initializeBridge(bridge) {
        try {
            const connType = this.getConnectionType();
            this.logger.log('info', 'Connection type:', connType);
            this.logger.log('info', "Initializing CCU Jack");
            this.bridges[bridge.serial] = new HomeMaticCCUJack(
                this.logger,
                this.homey,
                bridge.type,
                bridge.serial,
                bridge.address,
                this.settings.ccu_jack_mqtt_port,
                this.settings.ccu_jack_user,
                this.settings.ccu_jack_password,
            );
            return this.bridges[bridge.serial];
        } catch (err) {
            this.logger.log('error', `Failed to initialize bridge ${bridge.serial}:`, err);
        }
    }

    setBridgeAddress(serial, address) {
        if (this.bridges[serial]) {
            this.bridges[serial].address = address;
        } else {
            this.logger.log('error', `No bridge found for serial: ${serial}`);
        }
    }

    deleteStoredBridges() {
        const bridges = this.getStoredBridges();
        Object.keys(bridges).forEach((serial) => {
            this.homey.settings.unset(Constants.SETTINGS_PREFIX_BRIDGE + serial);
        });
    }

    getLogLines() {
        return this.logger.getLogLines();
    }
}

module.exports = Homematic;
