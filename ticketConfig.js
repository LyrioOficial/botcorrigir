const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const db = require("../botdb.js");
const config = require("../config.json");

module.exports = {
  run: async (interaction, client) => {
    const guildId = interaction.guild.id;

    // --- Abrir Ticket ---
    if (interaction.customId === "abrir_ticket") {
      const modal = new ModalBuilder()
        .setCustomId("abrir_ticket_modal")
        .setTitle("🎫 Abrir Ticket");

      const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("Motivo do ticket")
        .setRequired(false)
        .setMaxLength(150);

      modal.addComponents(new ActionRowBuilder().addComponents(text));
      return interaction.showModal(modal);
    }

    if (interaction.customId === "abrir_ticket_modal") {
      const motivo = interaction.fields.getTextInputValue("text") || "Nenhum motivo informado.";

      await interaction.reply({ content: "🔁 | Criando ticket...", ephemeral: true });

      const jaExiste = interaction.guild.channels.cache.find(c => c.topic === `ticket - ${interaction.user.id}`);
      if (jaExiste) return interaction.editReply({ content: "❌ | Você já tem um ticket aberto!" });

      const permissionOverwrites = [
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      ];

      if (config.cargo_staff) {
        permissionOverwrites.push({ id: config.cargo_staff, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
      }

      const channel = await interaction.guild.channels.create({
        name: `🎫・${interaction.user.username}`,
        topic: `ticket - ${interaction.user.id}`,
        parent: config.ticketCategory || null,
        type: ChannelType.GuildText,
        permissionOverwrites
      });

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name} | Novo Ticket`)
        .setDescription(`👤 Usuário: ${interaction.user}\n📌 Motivo: ${motivo}`)
        .setColor(config.cor || "#2f3136");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("fecharticket").setLabel("Fechar").setStyle(4).setEmoji("🔒")
      );

      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

      db.set(`ticket_${interaction.user.id}`, { channelId: channel.id, userId: interaction.user.id, guildId, motivo, status: "aberto", dataAbertura: Date.now() });

      await interaction.editReply({ content: "✅ | Ticket criado com sucesso!" });
    }

    // Aqui você pode adicionar reset de rankings e botConfig seguindo a mesma lógica
  }
};