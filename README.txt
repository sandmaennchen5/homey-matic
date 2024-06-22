# Homematic 2024

This app adds support for Homematic devices in Homey via the CCU3. Homematic 2024 is an actively maintained version of the Homematic app, originally created by Timo Wendt.

## Important Update

Starting from version 0.20.0, only CCU Jack is supported as the connection method. This decision was made because CCU Jack is the most simplistic and reliable option. All prior connection methods, including BidCos, Homematic IP, CUxD, and MQTT, are no longer supported by the app. This is a breaking change.

## CCU Jack Setup

### Introduction

CCU Jack is a great AddOn written in Go that can be installed on the CCU. It connects locally to the CCU XMLRPC API and provides the data via Rest and MQTT. The MQTT server is already integrated into the process itself. This replaces the Mosquitto AddOn and also the need to install Node Red for the connection from the Homey App.

CCU Jack is also the only way to use authentication for accessing the CCU from the Homey Homematic App.

### Setup Instructions for your CCU3

1. **Uninstall Existing MQTT AddOns**:
   - If you already have the Mosquitto AddOn or any other MQTT AddOn installed, you either have to uninstall that or change the MQTT Port and PortTLS of CCU Jack in `/usr/local/addons/ccu-jack/ccu-jack.cfg`. Otherwise, CCU Jack will not start as the ports are already allocated by Mosquitto.

2. **Install CCU Jack**:
   - Follow the [installation process of CCU Jack on the CCU](https://github.com/LRuesink-WebArray/homey-matic/wiki/CCU-Jack-Setup#introduction).

3. **Configure CCU Jack**:
   - If CUxD support is required, add `CUxD` to the list of interfaces in the config file at `/usr/local/addons/ccu-jack/ccu-jack.cfg` and restart the CCU Jack AddOn.

4. **Homey App Configuration**:
   - Set the MQTT port in the settings of the Homey Homematic App to match the port configured in the CCU Jack configuration file.

## Reporting Issues

- **GitHub Issues**:
  - If you encounter any issues, please open an issue on GitHub.

- **Unsupported Devices**:
  - If you have a device that is not currently supported, please open an issue on GitHub.

## Discovery

The app uses discovery to find your CCUs on the network. I was only able to test it with a single CCU. Therefore, it is possible that the app fails if multiple CCUs are discovered on the network.

## Credits

I would like to express my deep gratitude to the original creators and contributors of the Homematic app:

- Timo Wendt
- Bjoern Welker
- Lex Ruesink
- Simon Wenner

Thank you @hobbyquaker for your great work on binrpc, xmlrpc, hm-discover, and RedMatic.
