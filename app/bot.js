//t.me/swapTrackBot
const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
const axios = require('axios');
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
    const id = ctx?.chat?.id || ctx?.form?.id;
    axios.patch('http://0.0.0.0:3001/api/chat', {id}).then(() => {
        ctx.replyWithHTML(`Bot has been launched`);
    }).catch(error => {
        console.error('Error launching:', error);
    });
})

// Listen for the bot being removed from a chat
bot.command('launch', (ctx) => {
    const id = ctx?.chat?.id || ctx?.form?.id;
    axios.patch('http://0.0.0.0:3001/api/chat', {id}).then(() => {
        ctx.replyWithHTML(`Bot has been launched`);
    }).catch(error => {
        console.error('Error launching:', error);
    });
});

// Listen for the bot being added to a group
bot.on('new_chat_members', (ctx) => {
    ctx.message.new_chat_members.forEach((member) => {
        if (member.id === ctx.botInfo.id) {
            const id = ctx.chat.id;
            axios.patch('http://0.0.0.0:3001/api/chat', {id}).then(() => {
                ctx.replyWithHTML(`Bot has been launched`);
            }).catch(error => {
                console.error('Error launching:', error);
            });
        }
    });
});

module.exports = bot; // Export the bot instance