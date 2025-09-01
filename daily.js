const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database.js");

const recompensa = 5000;
const cooldown = 24 * 60 * 60 * 1000; // 24h
const bannerUrl = "https://cdn.discordapp.com/attachments/1410999216121315501/1411424825611911208/minecraft_wolf_barebones_shader.jpg";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Resgate sua recompensa diária."),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const agora = Date.now();

    db.get(
      "SELECT saldo, lastDaily FROM economia WHERE userId = ? AND guildId = ?",
      [userId, guildId],
      async (err, row) => {
        if (err) {
          console.error("Erro SELECT:", err);
          return interaction.reply({ content: "⚠️ Erro ao acessar o banco.", ephemeral: true });
        }

        if (!row) {
          // cria registro
          db.run(
            "INSERT INTO economia (userId, guildId, saldo, lastDaily) VALUES (?, ?, ?, ?)",
            [userId, guildId, recompensa, agora],
            (err2) => {
              if (err2) console.error("Erro INSERT:", err2);
              interaction.reply({
                content: `<a:Parabens:1411418662027530400> Você recebeu <:Wolfcoin:1411418726498304000> **${recompensa} wolf coins** pela recompensa diária!`
              });
            }
          );

          // agenda aviso para daqui 24h
          setTimeout(() => enviarAvisoDM(interaction.user), cooldown);

        } else if (agora - row.lastDaily < cooldown) {
          const restante = cooldown - (agora - row.lastDaily);
          const horas = Math.floor(restante / (1000 * 60 * 60));
          const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));

          interaction.reply({
            content: `⏰ Você já coletou seu daily hoje! Volte em **${horas}h ${minutos}m**.`,
            ephemeral: true
          });
        } else {
          // atualiza saldo
          db.run(
            "UPDATE economia SET saldo = saldo + ?, lastDaily = ? WHERE userId = ? AND guildId = ?",
            [recompensa, agora, userId, guildId],
            (err3) => {
              if (err3) console.error("Erro UPDATE:", err3);
              interaction.reply({
                content: `<a:Parabens:1411418662027530400> Você recebeu <:Wolfcoin:1411418726498304000> **${recompensa} wolf coins** pela recompensa diária!`
              });
            }
          );

          // agenda aviso para daqui 24h
          setTimeout(() => enviarAvisoDM(interaction.user), cooldown);
        }
      }
    );
  },
};

// Função para mandar aviso na DM
async function enviarAvisoDM(user) {
  try {
    const embed = new EmbedBuilder()
      .setTitle("✨ Recompensa Diária Disponível!")
      .setDescription("Sua recompensa diária já está liberada! Use **/daily** para resgatar e não perder!")
      .setColor("#00bfff")
      .setImage(bannerUrl)
      .setFooter({ text: "WolfBot - Sistema de Economia" });

    const dm = await user.createDM();
    dm.send({ embeds: [embed] });
  } catch (e) {
    console.log(`Não consegui enviar DM para ${user.tag}`);
  }
}