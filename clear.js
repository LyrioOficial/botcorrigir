const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Apaga mensagens do chat")
    .addIntegerOption(option =>
      option.setName("quantidade")
        .setDescription("Número de mensagens para apagar (1 - 1000)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    let quantidade = interaction.options.getInteger("quantidade");
    const channel = interaction.channel;

    // ✅ só funciona em canal de texto
    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "⚠️ Este comando só pode ser usado em canais de texto.",
        ephemeral: true
      });
    }

    // ✅ valida número
    if (quantidade < 1 || quantidade > 1000) {
      return interaction.reply({
        content: "⚠️ Você só pode apagar entre **1 e 1000 mensagens** por vez.",
        ephemeral: true
      });
    }

    // ✅ verifica se o bot tem permissão
    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "❌ Não tenho permissão para apagar mensagens aqui.",
        ephemeral: true
      });
    }

    let apagadasTotal = 0;

    try {
      // avisa que pode demorar
      await interaction.deferReply({ ephemeral: true });

      while (quantidade > 0) {
        const deleteAmount = Math.min(quantidade, 100);
        const mensagensApagadas = await channel.bulkDelete(deleteAmount, true);
        apagadasTotal += mensagensApagadas.size;
        quantidade -= deleteAmount;

        if (mensagensApagadas.size < deleteAmount) break;
      }

      await interaction.editReply(`Apaguei **${apagadasTotal}** mensagens neste canal!`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(" Não consegui apagar algumas mensagens (elas podem ser antigas, acima de 14 dias).");
    }
  }
};