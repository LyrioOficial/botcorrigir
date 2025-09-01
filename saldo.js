const { SlashCommandBuilder } = require("discord.js");
const db = require("../database.js"); // importa o banco

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Mostra o saldo de moedas do usuário.")
    .addUserOption(option =>
      option.setName("usuário")
        .setDescription("Veja o saldo de outra pessoa")
        .setRequired(false)
    ),

  async execute(interaction) {
    const alvo = interaction.options.getUser("usuário") || interaction.user;
    const guildId = interaction.guild.id;

    db.get(
      "SELECT saldo FROM economia WHERE userId = ? AND guildId = ?",
      [alvo.id, guildId],
      (err, row) => {
        if (err) {
          console.error("Erro SELECT saldo:", err);
          return interaction.reply({ content: "⚠️ Erro ao acessar o banco.", ephemeral: true });
        }

        const saldo = row ? row.saldo : 0;

        // pega todos os usuários do servidor para calcular ranking
        db.all(
          "SELECT userId, saldo FROM economia WHERE guildId = ? ORDER BY saldo DESC",
          [guildId],
          (err2, rows) => {
            if (err2) {
              console.error("Erro SELECT ranking:", err2);
              return interaction.reply({ content: "⚠️ Erro ao acessar o ranking.", ephemeral: true });
            }

            const posicao = rows.findIndex(u => u.userId === alvo.id) + 1;

            // emoji customizado (troque pelo ID do seu emoji)
            const COIN_EMOJI = "<a:Feliz:1411468558273347717>";

            const msg =
              `Você possui ${COIN_EMOJI} **${saldo.toLocaleString()} WolfCoins**.\n` +
              `🏆 Você é o **${posicao > 0 ? `${posicao}º` : "N/A"} mais rico!** ` +
              `Veja todo o ranque em \`/wolfcoins-rank\`.`;

            interaction.reply({ content: msg, ephemeral: false });
          }
        );
      }
    );
  }
};