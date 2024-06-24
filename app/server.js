const fastify = require('fastify')({ logger: true });
const axios = require('axios');
fastify.register(require('fastify-postgres'), {
  connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_SERVICE}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
});
fastify.register(require('./routes'));
fastify.register(require('../routes/migrations'));

fastify.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Credentials", true);
  reply.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept, X-Slug, X-UID");
  reply.header("Access-Control-Allow-Methods", "OPTIONS, POST, PUT, PATCH, GET, DELETE");
  if (request.method === "OPTIONS") {
    reply.send();
  }
});

// Run the server
const start = () => {
  const intervalId = setInterval(() => {
    axios.get('http://0.0.0.0:3001/api/swap');
    console.log('\nrequest sent\n');
  }, 15000);

  fastify.listen({
    port: 3001,
    host: '0.0.0.0'
  }, (err, address) => {
    if (err) {
      clearInterval(intervalId);
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening on ${address}`);
  });
};

start();
