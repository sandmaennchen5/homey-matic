'use strict';

const Device = require('../../lib/device.js');
const capabilityMap = {
  "onoff.channel2": { channel: 2, key: "STATE", set: { key: "STATE", channel: 2 } },
  "onoff.channel3": { channel: 3, key: "STATE", set: { key: "STATE", channel: 3 } },
  "onoff.channel4": { channel: 4, key: "STATE", set: { key: "STATE", channel: 4 } },
  "onoff.channel6": { channel: 6, key: "STATE", set: { key: "STATE", channel: 6 } },
  "onoff.channel7": { channel: 7, key: "STATE", set: { key: "STATE", channel: 7 } },
  "onoff.channel8": { channel: 8, key: "STATE", set: { key: "STATE", channel: 8 } },
  "dim": { channel: 11, key: "LEVEL", set: { key: "LEVEL", channel: 11 } },
};

class HomematicDevice extends Device {
  
  // Define a getter for the channels to avoid duplication
  get channels() {
    return [
      { id: "onoff.channel2", showKey: "ShowButtonChannel2", titleKey: "TitleButtonChannel2" },
      { id: "onoff.channel3", showKey: "ShowButtonChannel3", titleKey: "TitleButtonChannel3" },
      { id: "onoff.channel4", showKey: "ShowButtonChannel4", titleKey: "TitleButtonChannel4" },
      { id: "onoff.channel6", showKey: "ShowButtonChannel6", titleKey: "TitleButtonChannel6" },
      { id: "onoff.channel7", showKey: "ShowButtonChannel7", titleKey: "TitleButtonChannel7" },
      { id: "onoff.channel8", showKey: "ShowButtonChannel8", titleKey: "TitleButtonChannel8" },
    ];
  }

  async onInit() {
    super.onInit(capabilityMap);

    const settings = this.getSettings();

    // Configure each channel
    for (const channel of this.channels) {
      await this.configureChannel(channel, settings);
    }

    // Configure dimmer
    await this.configureDimmer(settings);
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    const quickActionChanged = changedKeys.includes("QuickActionChannel");

    for (const channel of this.channels) {
      if (
        quickActionChanged || // Reconfigure all channels if the quick action was changed
        changedKeys.includes(channel.showKey) ||
        changedKeys.includes(channel.titleKey)
      ) {
        await this.configureChannel(channel, newSettings);
      }
    }

    // Handle dimmer settings change
    if (changedKeys.includes("ShowDimmer") || changedKeys.includes("TitleDimmer")) {
      await this.configureDimmer(newSettings);
    }
  }

  async configureChannel(channel, settings) {
    const { id, showKey, titleKey } = channel;
    const isQuickAction = settings.QuickActionChannel === id;

    if (!settings[showKey]) {
      await this.setCapabilityOptions(id, { uiComponent: null, uiQuickAction: isQuickAction });
    } else {
      await this.setCapabilityOptions(id, {
        uiComponent: "toggle",
        title: settings[titleKey],
        uiQuickAction: isQuickAction,
      });
    }
  }

  async configureDimmer(settings) {
    if (!settings.ShowDimmer) {
      await this.setCapabilityOptions("dim", { uiComponent: null });
    } else {
      await this.setCapabilityOptions("dim", {
        uiComponent: "slider",
        title: settings.TitleDimmer,
      });
    }
  }
}

module.exports = HomematicDevice;
