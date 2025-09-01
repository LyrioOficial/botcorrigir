const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Remove o banimento de um usuário do servidor.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID do usuário que será desbanido")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("motivo")
        .setDescription("Motivo do desbanimento")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString("id");
    const motivo = interaction.options.getString("motivo") || "Nenhum motivo fornecido";

    try {
      // Verifica se o usuário está banido
      const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);

      if (!banInfo) {
        return interaction.reply({ content: " Esse usuário não está banido ou o ID é inválido.", ephemeral: true });
      }

      await interaction.guild.bans.remove(userId, motivo);

      await interaction.reply({
        content: `✅ O usuário <@${userId}> (\`${userId}\`) foi desbanido com sucesso.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("Erro ao desbanir:", error);
      return interaction.reply({
        content: "❌ Ocorreu um erro ao tentar desbanir o usuário.",
        ephemeral: true
      });
    }
  }
};