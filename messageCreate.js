// events/messageCreate.js
module.exports = {
  name: "messageCreate",
  async run(message, client) {
    if (message.author.bot) return;

    // Se o autor estava AFK e voltou
    if (client.afk.has(message.author.id)) {
      client.afk.delete(message.author.id);
      message.reply(`👋 Bem-vindo de volta, <@${message.author.id}>! Tirei seu AFK.`);
    }

    // Se a msg menciona alguém AFK
    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach(user => {
        if (client.afk.has(user.id)) {
          const motivo = client.afk.get(user.id);
          message.reply(`💤 <@${user.id}> está AFK.\n📝 Motivo: ${motivo}`);
        }
      });
    }
  }
};