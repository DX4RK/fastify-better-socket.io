const fp = require('fastify-plugin');
const { Server } = require('socket.io');

/**
 * Socket.IO plugin for Fastify 5
 * This plugin integrates Socket.IO with Fastify 5.x
 *
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Plugin options
 * @param {Object} opts.cors - CORS configuration for Socket.IO
 * @param {Function} opts.onConnection - Optional connection handler
 */

async function fastifySocketIO(fastify, opts) {
  fastify.addHook('onReady', async () => {
    const io = new Server(fastify.server, {
      cors: opts.cors || {
        origin: '*',
        methods: ['GET', 'POST']
      },
      ...opts
    });

    fastify.decorate('io', io);
    fastify.decorate('socketIO', io);

    fastify.log.info('Socket.IO initialized successfully');

    if (opts.onConnection && typeof opts.onConnection === 'function') {
      io.on('connection', (socket) => {
        opts.onConnection(socket, io, fastify);
      });
    }

    fastify.addHook('onClose', async (instance) => {
      fastify.log.info('Closing Socket.IO connections...');
      io.close();
    });
  });
}

module.exports = fp(fastifySocketIO, {
  fastify: '5.x',
  name: 'fastify-socket-io-v5'
});

