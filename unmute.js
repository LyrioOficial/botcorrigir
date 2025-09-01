// ComandosSlash/unmute.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove o mute de um usuário.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuário que será desmutado")
        .setRequired(true)
    ),

  async execute(interaction) {
    const membro = interaction.options.getMember("usuario");

    if (!membro) {
      return interaction.reply({ content: " Usuário não encontrado no servidor.", ephemeral: true });
    }

    try {
      // Remove o timeout (unmute)
      await membro.timeout(null);

      await interaction.reply({
        content: `✅ O usuário ${membro.user.tag} foi desmutado com sucesso.`,
        ephemeral: true
      });

    } catch (error) {
      console.error("Erro ao remover mute:", error);
      await interaction.reply({
        content: "Ocorreu um erro ao tentar remover o mute desse usuário.",
        ephemeral: true
      });
    }
  }
};