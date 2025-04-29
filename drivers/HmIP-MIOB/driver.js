'use strict';

const Homey = require('homey');
const Driver = require('../../lib/driver.js');

class HomematicDriver extends Driver {

    onInit() {
        super.onInit();
        this.capabilities = [
            'onoff.channel2',
            'onoff.channel3',
            'onoff.channel4',
            'onoff.channel6',
            'onoff.channel7',
            'onoff.channel8',
            'dim'
        ]
        this.homematicTypes = ['HmIP-MIOB'];
        this.log(this.homematicTypes.join(','), 'has been inited');
    }


}

module.exports = HomematicDriver;