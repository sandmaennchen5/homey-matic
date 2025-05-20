const { createServer } = require('homematic-xmlrpc');
const logger = require('../logger');

class RpcHandler {
  constructor() {
    this.servers = new Map();
    this.retryDelays = [1000, 3000, 5000]; // ms
  }

  async listen(interfaceConfig, onEvent) {
    const { type, port, host } = interfaceConfig;

    for (let attempt = 0; attempt < this.retryDelays.length; attempt++) {
      try {
        await this._createRpcServer({ host, port, type, onEvent });
        logger.info(`[RpcHandler] Listening on ${host}:${port} for ${type}`);
        return;
      } catch (err) {
        logger.warn(`[RpcHandler] Attempt ${attempt + 1} failed for ${type}: ${err.message}`);
        if (attempt < this.retryDelays.length - 1) {
          const delay = this.retryDelays[attempt];
          logger.info(`[RpcHandler] Retrying in ${delay}ms...`);
          await this._delay(delay);
        } else {
          logger.error(`[RpcHandler] Failed to start server for ${type} after ${attempt + 1} attempts`);
          throw err;
        }
      }
    }
  }

  async _createRpcServer({ host, port, type, onEvent }) {
    return new Promise((resolve, reject) => {
      const server = createServer({ host, port });

      const timeout = setTimeout(() => {
        reject(new Error('RPC server start timeout'));
      }, 5000);

      server.on('listening', () => {
        clearTimeout(timeout);
        this.servers.set(type, server);
        resolve();
      });

      server.on('event', (interfaceId, address, datapoint, value) => {
        try {
          onEvent({ interfaceId, address, datapoint, value });
        } catch (err) {
          logger.error(`[RpcHandler] Error in event handler for ${address}:`, err);
        }
      });

      server.on('NotFound', (method, params) => {
        logger.warn(`[RpcHandler] Unknown RPC method: ${method}`, params);
      });

      server.on('error', err => {
        clearTimeout(timeout);
        logger.error(`[RpcHandler] RPC server error (${type}):`, err);
        // Es ist kein Reject hier – der Server läuft evtl. schon.
      });
    });
  }

  async shutdown() {
    for (const [type, server] of this.servers.entries()) {
      try {
        server.close();
        logger.info(`[RpcHandler] RPC server for ${type} closed`);
      } catch (err) {
        logger.error(`[RpcHandler] Error closing server for ${type}:`, err);
      }
    }
    this.servers.clear();
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RpcHandler;
