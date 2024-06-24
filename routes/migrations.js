async function routes(fastify, options) {
    // INIT TABLE. Launch just once to create the table
    fastify.get('/api/initDB', (req, reply) => {
        return fastify.pg.transact(async client => {
            await client.query('CREATE TABLE IF NOT EXISTS "swaps" ("id" SERIAL PRIMARY KEY, "sequence_number" integer UNIQUE, "buy_value" BIGINT, "sell_value" BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());');
            await client.query('CREATE TABLE IF NOT EXISTS "chats" ("id" varchar(250) UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());');

            return true;
        })
    });
}

module.exports = routes;