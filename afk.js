const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Marca você como AFK.")
    .addStringOption(option =>
      option.setName("motivo")
        .setDescription("Motivo de estar AFK")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const motivo = interaction.options.getString("motivo") || "Não especificado";
    const userId = interaction.user.id;

    client.afk.set(userId, motivo);

    await interaction.reply({
      content: ` <@${userId}> agora está **AFK**.\n Motivo: ${motivo}`,
      ephemeral: false
    });
  }
};