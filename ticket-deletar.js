const { ApplicationCommandType, PermissionsBitField } = require("discord.js");
const db = require("../botdb.js");

module.exports = {
  name: "deletar-ticket",
  description: "Deleta todos os tickets criados",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: "⛔ | Permissão necessária!", ephemeral: true });
    }

    await interaction.reply({ content: "⌛ | Deletando todos os tickets...", ephemeral: true });

    const ticketPrefixes = ["🎫・", "⛔・", "📞・"];
    const channelsToDelete = interaction.guild.channels.cache.filter(c => ticketPrefixes.some(p => c.name.startsWith(p)));

    await Promise.all(channelsToDelete.map(ch => ch.delete().catch(() => {})));

    // Limpa tickets do db
    Object.keys(db.all()).forEach(key => {
      if (key.startsWith("ticket_")) db.delete(key);
    });

    await interaction.editReply({ content: "✅ | Todos os tickets foram deletados!" });
  }
};