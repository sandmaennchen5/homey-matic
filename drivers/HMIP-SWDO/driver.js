'use strict';

const Homey = require('homey');
const Driver = require('../../lib/driver.js');

class HomematicDriver extends Driver {

    onInit() {
        super.onInit();
        this.capabilities = [
            'alarm_contact',
            'alarm_battery'
        ]
        this.homematicTypes = ['HMIP-SWDO', 'HMIP-SWDO-A'];
        this.log(this.homematicTypes.join(','), 'has been inited');
    }


}

module.exports = HomematicDriver;