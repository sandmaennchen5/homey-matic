const { createServer } = require('homematic-xmlrpc');
const logger = require('../logger');

class RpcHandler {
  constructor() {
    this.servers = new Map();
  }

  async listen(interfaceConfig, onEvent) {
    const { type, port, host } = interfaceConfig;

    return new Promise((resolve, reject) => {
      const server = createServer({ host, port });

      server.on('listening', () => {
        logger.info(`[RpcHandler] Listening on ${host}:${port} for ${type}`);
        this.servers.set(type, server);
        resolve();
      });

      server.on('event', (interfaceId, address, datapoint, value) => {
        logger.debug(`[RpcHandler] Event from ${address}.${datapoint} = ${value}`);
        onEvent({ interfaceId, address, datapoint, value });
      });

      server.on('error', err => {
        logger.error(`[RpcHandler] Server error for ${type}:`, err);
        reject(err);
      });
    });
  }

  async shutdown() {
    for (const [type, server] of this.servers.entries()) {
      server.close();
      logger.info(`[RpcHandler] RPC server for ${type} closed`);
    }
    this.servers.clear();
  }
}

module.exports = RpcHandler;
