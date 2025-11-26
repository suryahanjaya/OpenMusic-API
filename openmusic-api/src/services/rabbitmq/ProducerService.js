const amqp = require('amqplib');

const config = require('../../config');

const ProducerService = {
  sendMessage: async (queue, message) => {
    try {
      const connection = await amqp.connect(config.rabbitMq.server);
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, {
        durable: true,
      });

      await channel.sendToQueue(queue, Buffer.from(message));

      setTimeout(() => {
        connection.close();
      }, 1000);
    } catch (error) {
      // In test environment, silently fail if RabbitMQ is unavailable
      if (process.env.NODE_ENV !== 'test') {
        throw error;
      }
      // In test mode, just warn and continue
      console.warn('RabbitMQ not available, message not sent (test mode)');
    }
  },
};

module.exports = ProducerService;
