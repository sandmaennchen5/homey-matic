# Homematic 2024

**Homematic 2024** is a Homey app for integrating Homematic and Homematic IP devices via a CCU3. It builds on the original [Homey-Matic app](https://github.com/LRuesink-WebArray/homey-matic) by Timo Wendt, Bjoern Welker, Lex Ruesink, and Simon Wenner. This fork provides a simpler, more robust, and future-proof foundation for reliable communication between your Homey and Homematic ecosystems.

> This app is not affiliated with, endorsed by, or supported by eQ-3 AG.

---

## From Version 0.20.0: A Cleaner, More Reliable Connection – CCU Jack

Starting with version **0.20.0**, **CCU Jack** is the exclusive method for connecting your CCU3 to Homey.

This decision was made with a clear goal:  
➡️ **Provide you with a stable, secure, and maintenance-free experience.**

Previously, multiple connection methods (XML-/BIN-RPC and MQTT via RedMatic) were supported. Although flexible, these methods introduced significant technical challenges:

- **RPC events were unreliable**, as Homey devices don’t expose open TCP ports on the local network.
- **MQTT setups via RedMatic required multiple complex add-ons** (Mosquitto, Node-RED, custom flows).
- Supporting multiple transport methods increased complexity, maintenance effort, and potential issues.

By exclusively using **CCU Jack**, we've eliminated these challenges.

### Benefits of CCU Jack:
- 🔒 **Secure**: Integrated authentication support
- ⚡ **Efficient**: Low resource usage and high stability
- 🔄 **Real-time**: Immediate device state updates (no polling)
- 🧱 **Easy Setup**: Single add-on, no third-party dependencies

This method is future-proof, reliable, and recommended for all users.

> If you're migrating from an older version, simply install CCU Jack, enter your connection details, and your existing setup will remain intact. No re-pairing is required.

---

## CCU Jack Setup Instructions

### What is CCU Jack?

CCU Jack is a lightweight add-on written in Go, running directly on your CCU. It connects internally to the CCU’s XMLRPC API and provides a convenient REST and MQTT interface. With CCU Jack, additional software such as Mosquitto and Node-RED is no longer necessary, significantly simplifying your setup.

### Quick Setup Guide

1. **Remove Existing MQTT Add-ons** *(if applicable)*:
   - If you previously used Mosquitto or another MQTT add-on, uninstall it or adjust CCU Jack’s MQTT ports (located in `/usr/local/addons/ccu-jack/ccu-jack.cfg`) to avoid conflicts.

2. **Download CCU Jack**:  
   👉 [Latest CCU Jack Release](https://github.com/mdzio/ccu-jack/releases)

3. **Install on Your CCU3**:  
   - Follow the [official CCU Jack installation guide](https://github.com/mdzio/ccu-jack/wiki/Installation-AddOn).

4. **Start and Verify CCU Jack**:  
   - Ensure it is listed as *running* in the CCU add-on interface.
   - *(Optional)* If you need CUxD support, add `CUxD` to the interface list in `/usr/local/addons/ccu-jack/ccu-jack.cfg`, then restart CCU Jack.

5. **Configure Homey App**:  
   - In your Homey Homematic App settings, enter the CCU Jack MQTT port and credentials (if set).
   - The default MQTT port is **1883**.

Your existing devices remain paired, and setup completes automatically.

---

## Migrating from Previous Versions (before 0.20.0)

1. Remove Mosquitto or Node-RED (optional, but recommended)
2. Install and start CCU Jack
3. Update your Homematic app on Homey to the latest version
4. Enter CCU Jack connection details in the Homey app settings

Your devices and flows will continue to operate seamlessly—no device re-pairing required.

---

## Reporting Issues and Contributing

Community contributions, bug reports, and feature suggestions are welcome!  

- **Report Issues**: [Open a GitHub issue](https://github.com/Baumus/homey-matic/issues)
- **Device Requests**: Open an issue for unsupported devices

---

## Discovery Notice

The app uses network discovery to find CCUs automatically. However, testing was done with a single CCU setup. Using multiple CCUs on your network may cause issues. Please open an issue if you experience difficulties in this scenario.

---

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
* HmIP-SWO-B
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
