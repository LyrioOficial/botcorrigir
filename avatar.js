const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Mostra o avatar de um usuário")
    .addUserOption(option =>
      option.setName("usuário")
        .setDescription("Selecione o usuário")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário") || interaction.user;
    const avatarURL = user.displayAvatarURL({ size: 1024, extension: "png", dynamic: true });

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setAuthor({ name: user.tag, iconURL: avatarURL })
      .setImage(avatarURL)
      .setFooter({ text: "Apesar de tudo, ainda é você." });

    const button = new ButtonBuilder()
      .setLabel("Abrir avatar no navegador")
      .setStyle(ButtonStyle.Link)
      .setURL(avatarURL);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};