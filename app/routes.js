async function routes(fastify, options) {
    const bot = require('./bot.js');
    const { AptosClient } = require('aptos');
    const aptClient = new AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');
    const eventHandleStruct = '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::PairEventHolder<0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2::assets_v1::EchoCoin002,0xf891d2e004973430cc2bbbee69f3d0f4adb9c7ae03137b4579f7bb9979283ee6::APTOS_FOMO::APTOS_FOMO>'; // Replace with the actual module and event
    const eventHandleField = 'swap'; // Replace with the actual event handle field
    const pairAddress = '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa';

    bot.launch();

    //DEX getSwapEvents
    fastify.get('/api/swap', (req, reply) => {
        console.log('\nrequest received\n');
        return fastify.pg.transact(async client => {
            try {
                const events = await aptClient.getEventsByEventHandle(pairAddress, eventHandleStruct, eventHandleField);
                if (events.length) {
                    const transactions = await client.query(`SELECT sequence_number FROM swaps`);
                    const chats = await client.query(`SELECT id FROM chats`);
                    const existedTransactions = transactions.rows.length ? transactions.rows.map(transaction => transaction.sequence_number) : [];
                    const existedChats = chats.rows.length ? chats.rows.map(transaction => transaction.id) : [];
                    const filteredEvents = events.filter(event => !existedTransactions.includes(+event.sequence_number));

                    if (!filteredEvents.length) return;

                    for (const i in filteredEvents) {
                        await client.query(`INSERT INTO swaps (sequence_number, buy_value, sell_value) VALUES($1,$2,$3) ON CONFLICT DO NOTHING;`, [filteredEvents[i].sequence_number, +filteredEvents[i].data.amount_y_out, +filteredEvents[i].data.amount_y_in]);

                        if (filteredEvents[i].data.amount_y_out !== '0' && existedChats.length) {
                            let iconsCount = Math.floor((+filteredEvents[i].data.amount_y_out) / 1000000000);

                            if (iconsCount > 400) {
                                iconsCount = 400;
                            }

                            for (const j in existedChats) {
                                try {
                                    await bot.telegram.sendMessage(
                                        existedChats[j],
                                        `
APTOS FOMO Buy!

${"🟢".repeat(iconsCount)}

🪙 ${(+(filteredEvents[i].data.amount_y_out) / 1000000).toLocaleString('en-US')} FOMO

📊 <a href="https://dexscreener.com/aptos/pcs-1896" style="color: BLUE; text-decoration: none;">CHART</a> 🔥 <a href="https://app.panora.exchange/swap?pair=APT_FOMO" style="color: BLUE; text-decoration: none;">BUY FOMO</a>
                                        `,
                                        { parse_mode: 'HTML', disable_web_page_preview: true }
                                    );
                                } catch (error) {
                                    console.error(`Error sending message to chat ID ${existedChats[j]}:`, error);
                                }
                            }
                        }
                    }
                } else {
                    console.log('No swap events found.');
                }
            } catch (error) {
                if (error.message.includes('resource_not_found')) {
                    console.error('Error: Resource not found. Please verify the address and event handle details.');
                } else {
                    console.error('An unexpected error occurred:', error);
                }
            }

        })
    });

    //Donuts claimed
    fastify.patch('/api/donuts-claimed', (req, reply) => {
        return fastify.pg.transact(async client => {
            const donuts = req.body.donuts;

            if (!donuts) {
                return reply.status(422).send(new Error('Invalid data'));
            }

            const chats = await client.query(`SELECT id FROM chats`);
            const existedChats = chats.rows.length ? chats.rows.map(chat => chat.id) : [];

            for (const j in existedChats) {
                try {
                    await bot.telegram.sendMessage(
                        existedChats[j],
                        `
GOLD DONUT CLAIMED!

${"🍩".repeat(donuts)}

🍩 x${donuts} Gold Donuts 

📊 <a href="https://dexscreener.com/aptos/pcs-1896" style="color: BLUE; text-decoration: none;">CHART</a> 🔥 <a href="https://app.panora.exchange/swap?pair=APT_FOMO" style="color: BLUE; text-decoration: none;">BUY FOMO</a>
                                        `,
                        { parse_mode: 'HTML', disable_web_page_preview: true }
                    );
                } catch (error) {
                    console.error(`Error sending message to chat ID ${existedChats[j]}:`, error);
                }
            }
        })
    });

    fastify.patch('/api/chat', (req, reply) => {
        return fastify.pg.transact(async client => {
            const chatId = req.body.id;

            if (!chatId) {
                return reply.status(422).send(new Error('Invalid data'));
            }

            await client.query(`INSERT INTO chats (id) values($1)`, [chatId]);
        })
    });


}

module.exports = routes;