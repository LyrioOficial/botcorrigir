const {
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const { JsonDB } = require("wio.db");
const fs = require("fs");
const path = require("path");

// Caminho seguro para config.json na raiz do projeto
const config = require(path.join(__dirname, "..", "config.json"));

// wio.db para tickets
const ticketDB = new JsonDB({ databasePath: "./db.json" });

module.exports = {
  name: "interactionCreate",
  run: async (interaction, client) => {
    const customId = interaction.customId;
    if (!customId) return;

    const colorEmbed = config.cor ?? "#2f3136";

    // abrir modal
    if (customId === "abrir_ticket") {
      const modal = new ModalBuilder()
        .setCustomId("abrir_ticket_modal")
        .setTitle("🎫 - Ticket");

      const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setRequired(false)
        .setLabel("Qual é o motivo do ticket?")
        .setPlaceholder("Resgatar um produto...")
        .setMaxLength(150);

      modal.addComponents(new ActionRowBuilder().addComponents(text));
      return interaction.showModal(modal);
    }

    // criar ticket
    if (customId === "abrir_ticket_modal") {
      const motivo =
        interaction.fields.getTextInputValue("text") ||
        "Nenhum motivo informado.";

      await interaction.reply({
        content: "🔁 | Aguarde um momento, estou criando seu ticket...",
        ephemeral: true,
      });

      // verifica se já existe um ticket desse usuário
      const jaExiste = interaction.guild.channels.cache.find(
        (c) => c.topic === `ticket - ${interaction.user.id}`
      );

      if (jaExiste) {
        return interaction.editReply({
          content: "❌ | Você já tem um ticket aberto!",
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setURL(jaExiste.url)
                .setEmoji("🎫")
                .setLabel("Ir ao Ticket")
                .setStyle(5)
            ),
          ],
          ephemeral: true,
        });
      }

      // permissões
      const permissionOverwrites = [
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ];

      // adiciona cargo staff se configurado
      if (config.cargo_staff) {
        permissionOverwrites.push({
          id: config.cargo_staff,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageMessages,
          ],
        });
      }

      // cria o canal
      const categoryId = config.ticketCategory ?? null;
      const channel = await interaction.guild.channels.create({
        name: `🎫・${interaction.user.username}`,
        topic: `ticket - ${interaction.user.id}`,
        parent: categoryId,
        type: ChannelType.GuildText,
        permissionOverwrites,
      });

      // embed inicial
      const embed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name} | Novo Ticket`)
        .setDescription(
          `👤 Usuário: ${interaction.user}\n📌 Motivo: ${motivo}\n\nStaff pode assumir este ticket.`
        )
        .setColor(colorEmbed);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fecharticket")
          .setLabel("Fechar")
          .setStyle(4)
          .setEmoji("🔒")
      );

      const msg = await channel.send({
        content: `${interaction.user} ${
          config.cargo_staff ? `<@&${config.cargo_staff}>` : ""
        }`,
        embeds: [embed],
        components: [row],
      });

      await msg.pin();

      await interaction.editReply({
        content: "✅ | Seu ticket foi criado com sucesso!",
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Ir ao Ticket")
              .setStyle(5)
              .setEmoji("🎫")
              .setURL(channel.url)
          ),
        ],
      });

      // salva no wio.db
      ticketDB.set(`ticket_${interaction.user.id}`, {
        channelId: channel.id,
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        motivo: motivo,
        dataAbertura: Date.now(),
        status: "aberto"
      });
    }
  },
};