const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType
} = require("discord.js");
const { JsonDB } = require("wio.db");

// wio.db para dados (uma única instância para o mesmo db.json)
const db = new JsonDB({ databasePath: "./db.json" });

module.exports = {
  name: "interactionCreate",
  run: async (interaction, client) => {

    const guildId = interaction.guild.id;

    // --- Reset modal ---
    if (interaction.isModalSubmit() && interaction.customId === "resetmodal") {
      const text = interaction.fields.getTextInputValue("text");
      const text1 = interaction.fields.getTextInputValue("text1");

      if (text !== "SIM" || text1 !== "CONFIRMO") {
        return interaction.reply({ content: `✅ | Cancelado com sucesso!`, ephemeral: true });
      }

      await interaction.reply({ content: `🔁 | Aguarde um momento, estou resetando as configurações...`, ephemeral: true });

      // Resetar configurações do bot
      db.set(`botConfig.${guildId}`, {
        cor: "#00FFFF",
        category: null,
        systemsendmsg: 1,
        pix: "Não Configurado"
      });

      // --- Deletar canais de tickets abertos ---
      interaction.guild.channels.cache
        .filter(c => c.name.includes('🎫・') || c.name.includes('⛔・') || c.name.includes('📞・'))
        .forEach(ch => ch.delete().catch(() => {}));

      // --- Limpar tabelas wio.db ---
      db.delete(`ticketConfig.${guildId}`);
      db.delete(`category.${guildId}`);
      db.delete(`perfil.${guildId}`);

      await interaction.editReply({ content: `✅ | Todos os tickets, categorias e rankings foram resetados com sucesso!` });
    }

    // --- Reset ranking aberto ---
    if (interaction.isModalSubmit() && interaction.customId === "resetrankmodal") {
      const text = interaction.fields.getTextInputValue("text");
      if (text !== "SIM") return interaction.reply({ content: `✅ | Cancelado com sucesso.`, ephemeral: true });

      await interaction.reply({ content: "🔁 | Resetando o Ranking de Tickets Abertos...", ephemeral: true });

      db.set(`perfil.${guildId}.ticketsaberto`, 0);

      interaction.editReply({ content: `✅ | Ranking de Tickets Abertos resetado com sucesso!` });
    }

    // --- Reset ranking assumido ---
    if (interaction.isModalSubmit() && interaction.customId === "resetrankadmmodal") {
      const text = interaction.fields.getTextInputValue("text");
      if (text !== "SIM") return interaction.reply({ content: `✅ | Cancelado com sucesso.`, ephemeral: true });

      await interaction.reply({ content: "🔁 | Resetando o Ranking de Tickets Assumidos...", ephemeral: true });

      db.set(`perfil.${guildId}.assumidos`, 0);

      interaction.editReply({ content: `✅ | Ranking de Tickets Assumidos resetado com sucesso!` });
    }

  }
};