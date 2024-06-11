# Homey-Matic

This is the actively maintained version of the Homey-Matic app, originally created by LRuesink-WebArray. This version includes support for new devices and additional features.

## New Features
- Support for HmIP-SWO-B

## Overview

This app adds support for Homematic devices in Homey via the CCU2/CCU3/RaspberryMatic.

### Supported Interfaces
Devices can be connected to the CCU via the following interfaces:
* BidCos
* Homematic IP
* CUxD

## MQTT Support

As of version 0.15.0, the app supports connection to the CCU via MQTT. This feature is currently considered experimental, as future updates to the CCU might require changes to the app, potentially causing it to stop working until those changes are implemented.

The MQTT functionality depends on RedMatic (Node-RED) and Mosquitto (MQTT broker) being configured on the CCU, and therefore only supports CCU3 and RaspberryMatic.

### Benefits of MQTT
- More stable than the RPC connection used otherwise.
- Fixes issues where devices stopped working after some time, requiring a restart of the app.
- Improved performance, making switch operations faster and more reliable.

For a detailed setup guide, see the [Wiki](https://github.com/twendt/homey-matic/wiki/MQTT-Setup).

## Important Notices
- It is recommended to disable auto-update for this app in Homey and always check this page to ensure no action is required before updating.
- If you encounter any issues, please open an issue on GitHub.
- If your device is not supported, please open an issue on GitHub and we will look into it.

The app uses discovery to find your CCUs on the network. It has been tested with a single CCU, so it might fail if multiple CCUs are discovered on the network.

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

Thank you [@hobbyquaker](https://github.com/hobbyquaker) for your great work on binrpc, xmlrpc, hm-discover and RedMatic.
