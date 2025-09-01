// commands/container.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("container")
    .setDescription("Abre o painel de criação de Container"),

  async execute(interaction) {
    // Embed inicial
    const embed = new EmbedBuilder()
      .setTitle("📦 Painel de Criação de Container")
      .setDescription(
        "Nenhum container criado ainda.\n\n➡️ Clique em ➕ Adicionar Container para começar."
      )
      .setColor("#2F3136");

    // Botão estilo link
    const linkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🌐 Meu Canal") // máx 25 chars
        .setStyle(ButtonStyle.Link)
        .setURL("https://youtube.com/@kingzada01?si=3sg7L6Q2eU-IJXzF")
    );

    // Menu de seleção desativado (placeholder fake obrigatório)
    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("selecionar_container")
        .setPlaceholder("Nenhum container criado ainda")
        .setDisabled(true)
        .addOptions([
          {
            label: "Nenhum disponível", // máx 25 chars
            value: "none", // máx 100 chars
            description: "Ainda não existem containers", // máx 100 chars
          },
        ])
    );

    // Botão de adicionar container
    const addRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("adicionar_container")
        .setLabel("Adicionar Container") // máx 80 chars
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("➕")
    );

    // Botões de envio (desativados no começo)
    const enviarRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enviar_personalizado")
        .setLabel("Enviar Personalizado")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🔗")
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId("enviar_rapido")
        .setLabel("Enviar Rápido")
        .setStyle(ButtonStyle.Success)
        .setEmoji("📨")
        .setDisabled(true)
    );

    // Resposta ao comando
    await interaction.reply({
      embeds: [embed],
      components: [linkRow, menuRow, addRow, enviarRow],
      flags: 64, // ✅ substitui ephemeral: true (evita warning)
    });
  },
};