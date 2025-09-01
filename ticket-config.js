const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const db = require("../botdb.js");

module.exports = {
  name: "ticket-config",
  description: "Configure o sistema de ticket",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: "⛔ | Permissão necessária!", ephemeral: true });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${interaction.guild.name} | Sistema de Ticket`)
          .setDescription("Escolha uma opção no menu abaixo.")
          .setColor("Random")
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("ticket_config_menu")
            .setPlaceholder("Escolha uma opção para configurar")
            .setMaxValues(1)
            .addOptions(
              { label: "Categoria", value: "category" },
              { label: "Sistema", value: "system" },
              { label: "Logs", value: "logs" },
              { label: "Staff", value: "staff" }
            )
        )
      ]
    });

    const filter = i => i.customId === "ticket_config_menu" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async i => {
      await i.deferReply({ ephemeral: true });

      const guildConfig = db.get(`ticketConfig.${interaction.guild.id}`) || {};
      const setConfig = (key, value) => {
        guildConfig[key] = value;
        db.set(`ticketConfig.${interaction.guild.id}`, guildConfig);
      };

      const option = i.values[0];
      await i.editReply(`Configuração selecionada: ${option}`);
      // Aqui você pode adicionar coletores de mensagem para cada opção
    });
  }
};