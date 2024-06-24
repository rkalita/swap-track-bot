//t.me/swapTrackBot
const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
const axios = require('axios');
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
    const id = ctx.from.id;
    axios.patch('http://0.0.0.0:3001/api/chat', {id}).then(() => {
        ctx.replyWithHTML(`Bot has been launched`);
    }).catch(error => {
        console.error('Error launching:', error);
    });
})

// Listen for the bot being removed from a chat
bot.command('launch', (ctx) => {
    const id = ctx.from.id;
    axios.patch('http://0.0.0.0:3001/api/chat', {id}).then(() => {
        ctx.replyWithHTML(`Bot has been launched`);
    }).catch(error => {
        console.error('Error launching:', error);
    });
});

// Listen for the bot being removed from a chat
bot.on('left_chat_member', (ctx) => {
    if (ctx.leftChatMember.id === ctx.botInfo.id) {
        console.log(`Bot was removed from chat: ${ctx.chat.id}`);
        // You can handle any cleanup or notifications here
    }
});

module.exports = bot; // Export the bot instance