const { 
  ApplicationCommandType, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder 
} = require("discord.js");

const { Database } = require("wio.db");
const db = new Database({ databasePath: "./db.json" });

module.exports = {
  name: "ticket-enviar",
  description: "Envia o painel do ticket no canal atual",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has("ManageGuild")) {
      return interaction.reply({ content: "⛔ | Você precisa da permissão **Gerenciar Servidor**!", ephemeral: true });
    }

    await interaction.reply({ content: "⌛ | Enviando o painel...", ephemeral: true });

    const painel = await db.get("painel") || {};
    const allCategories = await db.get("categories") || [];

    const embed = new EmbedBuilder()
      .setTitle(painel.title || "Painel de Tickets")
      .setFooter({ text: painel.footer || "", iconURL: interaction.guild.iconURL() })
      .setColor(painel.cor || "Random")
      .setDescription((painel.desc || "Escolha uma opção abaixo:").replace("${interaction.guild.name}", interaction.guild.name));

    if (painel.banner && painel.banner.startsWith("https://")) embed.setImage(painel.banner);

    let row;
    const open = await db.get("open") || {};

    if (open.system === "Select") {
      if (!allCategories || allCategories.length === 0) 
        return interaction.editReply({ content: "❌ | Nenhuma categoria criada.", ephemeral: true });

      row = new StringSelectMenuBuilder()
        .setCustomId("tickets_select")
        .setMaxValues(1)
        .setPlaceholder(painel.placeholder || "Selecione uma opção")
        .addOptions(
          allCategories.map(cat => ({
            label: cat.titulo,
            description: cat.desc,
            emoji: cat.emoji,
            value: cat.id
          }))
        );

    } else {
      row = new ButtonBuilder()
        .setCustomId("abrir_ticket")
        .setLabel(open.button?.label || "Abrir Ticket")
        .setStyle(open.button?.style || "Primary")
        .setEmoji(open.button?.emoji || null);
    }

    await interaction.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(row)] });
    await interaction.editReply({ content: "✅ | Painel enviado com sucesso.", ephemeral: true });
  }
};