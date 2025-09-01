// events/interactionCreate.js
const db = require("../database.js");
const transferencias = require("../transferenciasMap");
const { randomUUID } = require("crypto");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

// memória simples pra containers (depois pode salvar no DB se quiser)
const containers = new Map(); // guildId => [ { label, description, value } ]

// Importa o módulo do ticketConfig
const ticketConfigHandler = require("./ticketConfig");

module.exports = {
  name: "interactionCreate",
  async run(interaction, client) {
    try {
      // ==============================
      // 📌 1. Slash Commands
      // ==============================
      if (interaction.isChatInputCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;

        try {
          await cmd.execute(interaction, client, transferencias, randomUUID);
        } catch (err) {
          console.error("❌ Erro no comando:", err);
          await interaction.reply({
            content: "⚠️ Houve um erro interno ao executar este comando.",
            ephemeral: true,
          });
        }
        return;
      }

      // ==============================
      // 📌 2. Botões
      // ==============================
      if (interaction.isButton()) {
        // 🔹 Sistema de Containers
        if (interaction.customId === "adicionar_container") {
          const modal = new ModalBuilder()
            .setCustomId("criar_container_modal")
            .setTitle("➕ Criar Novo Container");

          const nomeInput = new TextInputBuilder()
            .setCustomId("nome_container")
            .setLabel("Nome do Container")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: Pacote Premium")
            .setRequired(true);

          const descInput = new TextInputBuilder()
            .setCustomId("desc_container")
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Digite uma breve descrição do container.")
            .setRequired(false);

          modal.addComponents(
            new ActionRowBuilder().addComponents(nomeInput),
            new ActionRowBuilder().addComponents(descInput)
          );

          return interaction.showModal(modal);
        }

        if (interaction.customId === "enviar_personalizado") {
          return interaction.reply({
            content: "🔗 Você escolheu **Enviar Personalizado**!",
            ephemeral: true,
          });
        }

        if (interaction.customId === "enviar_rapido") {
          return interaction.reply({
            content: "📨 Você escolheu **Enviar Rápido**!",
            ephemeral: true,
          });
        }

        // 🔹 Delegar botões de botconfig para o ticketConfig
        if (interaction.customId.includes("_botconfig") || interaction.customId.includes("_voltar") || interaction.customId.includes("_personalizar")) {
          return ticketConfigHandler.run(interaction, client);
        }

        return;
      }

      // ==============================
      // 📌 3. Menus de Seleção
      // ==============================
      if (interaction.isStringSelectMenu()) {
        // 🔹 Containers
        if (interaction.customId === "selecionar_container") {
          return interaction.reply({
            content: `📦 Você selecionou o container: **${interaction.values[0]}**`,
            ephemeral: true,
          });
        }

        // 🔹 Delegar menus de botconfig para o ticketConfig
        if (interaction.customId.includes("_botconfig") || interaction.customId.includes("_personalizar")) {
          return ticketConfigHandler.run(interaction, client);
        }

        return;
      }

      // ==============================
      // 📌 4. Modals
      // ==============================
      if (interaction.isModalSubmit()) {
        if (interaction.customId === "criar_container_modal") {
          const nome = interaction.fields.getTextInputValue("nome_container");
          const desc =
            interaction.fields.getTextInputValue("desc_container") ||
            "Sem descrição";

          // salva container no Map por servidor
          const guildId = interaction.guild.id;
          if (!containers.has(guildId)) containers.set(guildId, []);
          const lista = containers.get(guildId);

          const novoOption = {
            label: nome,
            description: desc,
            value: `container_${Date.now()}`,
          };

          lista.push(novoOption);

          // cria o menu atualizado
          const menu = new StringSelectMenuBuilder()
            .setCustomId("selecionar_container")
            .setPlaceholder("Selecione um container")
            .addOptions(lista);

          const menuRow = new ActionRowBuilder().addComponents(menu);

          await interaction.reply({
            content: `✅ Container **${nome}** criado com sucesso!`,
            components: [menuRow],
            ephemeral: true,
          });
        }
        return;
      }
    } catch (err) {
      console.error("Erro geral no interactionCreate:", err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "⚠️ Ocorreu um erro inesperado ao processar a interação.",
          ephemeral: true,
        });
      }
    }
  },
};