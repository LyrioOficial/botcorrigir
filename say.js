const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Faz o bot falar algo no chat.")
    .addStringOption(option =>
      option.setName("mensagem")
        .setDescription("O que o bot deve dizer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensagem = interaction.options.getString("mensagem");

    // O bot responde diretamente no comando
    await interaction.reply(mensagem);
  },
};