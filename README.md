# Homematic CCU3

This app adds support for Homematic devices in Homey via the CCU3. Homematic CCU3 is an actively maintained version of the Homematic app, originally created by Timo Wendt.

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

## Supported Devices

### BidCos Devices
* HM-CC-RT-DN
* HM-ES-PMSw1-DR
* HM-ES-PMSw1-Pl
* HM-ES-PMSw1-Pl-DN-R5
* HM-ES-TX-WM
* HM-LC-Bl1-FM
* HM-LC-Bl1PBU-FM
* HM-LC-Dim1PWM-CV
* HM-LC-Dim1T-CV
* HM-LC-Dim1T-DR
* HM-LC-Dim1T-FM
* HM-LC-Dim1TPBU-FM
* HM-LC-Sw1-Ba-PCB
* HM-LC-Sw1-DR
* HM-LC-Sw1-FM
* HM-LC-Sw1-Pl
* HM-LC-Sw1-Pl-2
* HM-LC-Sw1-Pl-CT-R1
* HM-LC-Sw1-Pl-DN-R1
* HM-LC-Sw1-Pl-DN-R5
* HM-LC-Sw1PBU-FM
* HM-LC-Sw2-FM
* HM-LC-Sw2PBU-FM
* HM-LC-Sw4-Ba-PCB
* HM-LC-Sw4-DR
* HM-LC-Sw4-DR-2
* HM-LC-Sw4-SM
* HM-LC-Sw4-WM
* HM-MOD-Re-8
* HM-OU-LED16
* HM-PB-2-FM
* HM-PB-2-WM55-2
* HM-PB-4-WM
* HM-PB-6-WM55
* HM-PBI-4-FM
* HM-RC-2-PBU-FM
* HM-RC-4
* HM-RC-4-2
* HM-RC-4-3
* HM-RC-8
* HM-RC-Key4-2
* HM-RC-Key4-3
* HM-RC-Sec4-3
* HM-SCI-3-FM
* HM-Sec-Key
* HM-Sec-MDIR-2
* HM-Sec-RHS
* HM-Sec-SC
* HM-Sec-SC-2
* HM-Sec-SCo
* HM-Sec-SD
* HM-Sec-SD-2
* HM-Sec-Sir-WM
* HM-Sec-WDS
* HM-Sec-WDS-2
* HM-Sen-DB-PCB
* HM-Sen-MDIR-O
* HM-Sen-MDIR-O-2
* HM-Sen-MDIR-O-3
* HM-Sen-MDIR-WM55
* HM-Sen-RD-O
* HM-SwI-3-FM
* HM-TC-IT-WM-W-EU
* HM-WDS10-TH-O
* HM-WDS100-C6-O
* HM-WDS30-T-O
* HM-WS550STH-I

### Homematic IP Devices
* HMIP-PS
* HMIP-PSM
* HMIP-SWDO
* HMIP-WRC2
* HMIP-WTH
* HMIP-eTRV
* HmIP-ASIR
* HmIP-ASIR-2
* HmIP-BDT
* HmIP-BRA
* HmIP-BRC2
* HmIP-BROLL
* HmIP-BSM
* HmIP-BWTH
* HmIP-BWTH24
* HmIP-DRSI1
* HmIP-FCI1
* HmIP-FBL
* HmIP-FDT
* HmIP-FROLL
* HmIP-FSM
* HmIP-FSM16
* HmIP-MOD-HO
* HmIP-MOD-OC8
* HmIP-PCBS
* HmIP-PCBS-BAT
* HmIP-PS-CH
* HmIP-PS-PE
* HmIP-PS-UK
* HmIP-PSM-CH
* HmIP-RC8
* HmIP-SAM
* HmIP-SCI
* HmIP-SLO
* HmIP-SMI
* HmIP-SMI55
* HmIP-SMO
* HmIP-SMO-A
* HmIP-SPI
* HmIP-SRH
* HmIP-STE2-PCB
* HmIP-STH
* HmIP-STHD
* HmIP-STHO
* HmIP-SWD
* HmIP-SWDM
* HmIP-SWDO-I
* HmIP-SWO-PR
* HmIP-SWSD
* HmIP-WRC6
* HmIP-WTH-2
* HmIP-eTRV-2
* HmIP-eTRV-B
* HmIP-eTRV-C

## Credits

I would like to express my deep gratitude to the original creators and contributors of the Homematic app:
- Timo Wendt
- Bjoern Welker
- Lex Ruesink
- Simon Wenner

Thank you [@hobbyquaker](https://github.com/hobbyquaker) for your great work on binrpc, xmlrpc, hm-discover and RedMatic.
