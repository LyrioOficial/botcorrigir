// ComandosSlash/pay.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../database");
const { randomUUID } = require("crypto");

// Mapa global de transações
const transferencias = require("../transferenciasMap"); // arquivo que exporta o Map global

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Transfere moedas para outro usuário")
    .addUserOption(opt =>
      opt.setName("alvo")
        .setDescription("Usuário que vai receber")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("quantia")
        .setDescription("Quantia a transferir")
        .setRequired(true)
    ),

  async execute(interaction) {
    const pagador = interaction.user;
    const alvo = interaction.options.getUser("alvo");
    const quantia = interaction.options.getInteger("quantia");
    const guildId = interaction.guild.id;

    if (alvo.id === pagador.id) {
      return interaction.reply({ 
        content: " Você não pode transferir para si mesmo.", 
        ephemeral: true 
      });
    }

    // consulta saldo do pagador
    db.get(
      "SELECT saldo FROM economia WHERE userId = ? AND guildId = ?",
      [pagador.id, guildId],
      async (err, row) => {
        if (err) {
          console.error(err);
          return interaction.reply({ content: " Erro ao acessar o banco.", ephemeral: true });
        }

        if (!row || row.saldo < quantia) {
          return interaction.reply({ content: " Você não tem saldo suficiente.", ephemeral: true });
        }

        // cria transação
        const transactionId = randomUUID();
        const expira = Date.now() + 15 * 60 * 1000; // 15 minutos

        transferencias.set(transactionId, {
          pagadorId: pagador.id,
          alvoId: alvo.id,
          quantia,
          guildId,
          expira,
          confirmados: new Set()
        });

        // mensagem normal
        const msgTxt = `<:Alert:1411457925578494153> **Transferência pendente**\n\n` +
          ` **${pagador}** deseja transferir **${quantia} <:Wolfcoin:1411418726498304000> WolfCoins** para **${alvo}**.\n` +
          ` Expira em <t:${Math.floor(expira / 1000)}:R>\n\n` +
          `Ambos devem confirmar para concluir.`;

        const rowBtn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`aceitar_${transactionId}`)
            .setLabel("🤝 Aceitar Transferência (0/2)")
            .setStyle(ButtonStyle.Primary)
        );

        // precisa usar fetchReply: true pra poder editar depois
        const msg = await interaction.reply({ content: msgTxt, components: [rowBtn], fetchReply: true });

        // expiração automática
        setTimeout(async () => {
          if (transferencias.has(transactionId)) {
            transferencias.delete(transactionId);
            try {
              await msg.edit({
                content: `⏰ Transferência entre **${pagador}** e **${alvo}** expirou!`,
                components: []
              });
            } catch (e) {
              console.error("Erro ao expirar transação:", e.message);
            }
          }
        }, 15 * 60 * 1000);
      }
    );
  }
};