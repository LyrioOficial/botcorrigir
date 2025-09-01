const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um usuário do servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option
        .setName("usuário")
        .setDescription("Selecione o usuário que deseja banir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("motivo")
        .setDescription("Motivo do banimento")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const motivo = interaction.options.getString("motivo");

    const membro = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!membro) {
      return interaction.reply({
        content: "Não encontrei esse usuário no servidor.",
        ephemeral: true,
      });
    }

    if (!membro.bannable) {
      return interaction.reply({
        content: " Não consigo banir esse usuário (ele pode ter cargo maior ou permissões elevadas).",
        ephemeral: true,
      });
    }

    // Embed que vai na DM do usuário
    const embedDM = new EmbedBuilder()
      .setColor("Red")
      .setAuthor({
        name: `Você foi banido de ${interaction.guild.name}!`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setDescription(
        `🚫 Você foi **banido** de **${interaction.guild.name}**!\n\n` +
        `👮 **Punido por:** ${interaction.user.tag}\n` +
        `📝 **Motivo:** ${motivo}\n\n` +
        `📅 ${new Date().toLocaleString("pt-BR")}`
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

    try {
      // Tenta mandar a DM antes de banir
      await user.send({ embeds: [embedDM] }).catch(() => {});

      // Agora bane o usuário
      await membro.ban({ reason: motivo });

      return interaction.reply({
        content: `✅ Usuário **${user.tag}** foi banido com sucesso!\n📌 Motivo: ${motivo}`,
      });
    } catch (error) {
      console.error("[ERRO AO BANIR]", error);
      return interaction.reply({
        content: " Ocorreu um erro ao tentar banir o usuário.",
        ephemeral: true,
      });
    }
  },
};