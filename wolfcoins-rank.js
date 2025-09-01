// ComandosSlash/rank.js
const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder 
} = require("discord.js");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./economia.sqlite");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wolfcoins-rank")
    .setDescription(" Mostra o ranking completo de WolfCoins"),
  
  async execute(interaction) {
    await interaction.deferReply();

    // Buscar ranking no banco
    db.all("SELECT userId, saldo FROM economia WHERE guildId = ? ORDER BY saldo DESC", [interaction.guild.id], async (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.editReply("❌ Erro ao buscar o ranking!");
      }

      if (!rows || rows.length === 0) {
        return interaction.editReply("⚡ Ninguém tem WolfCoins ainda!");
      }

      const pageSize = 10;
      const totalPages = Math.ceil(rows.length / pageSize);

      // Função de embed
      const getEmbed = (page) => {
        const start = page * pageSize;
        const current = rows.slice(start, start + pageSize);

        let desc = current.map((user, index) => {
          const pos = start + index + 1;
          const member = interaction.guild.members.cache.get(user.userId);
          const name = member ? member.user.username : `User ${user.userId}`;
          return `**${pos}º** - <@${user.userId}> | <:wolfcoin:1411418726498304000> **${user.saldo}** `;
        }).join("\n");

        return new EmbedBuilder()
          .setColor("#00BFFF")
          .setTitle(" WOLFCOINS RANKING ")
          .setDescription(desc || "Ninguém nessa página ainda.")
          .setFooter({ text: `Página ${page + 1}/${totalPages}` });
      };

      let currentPage = 0;

      // Botões
      const buttons = () => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1)
      );

      // Dropdown
      const dropdown = () => new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("jump")
          .setPlaceholder("📑 Pular para página...")
          .addOptions(
            Array.from({ length: totalPages }, (_, i) => ({
              label: `Página ${i + 1}`,
              value: i.toString()
            }))
          )
      );

      let message = await interaction.editReply({ 
        embeds: [getEmbed(currentPage)], 
        components: [buttons(), dropdown()] 
      });

      // Collector
      const collector = message.createMessageComponentCollector({ time: 120000 });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "⚠️ Só quem usou o comando pode interagir!", ephemeral: true });
        }

        if (i.customId === "prev") currentPage--;
        if (i.customId === "next") currentPage++;
        if (i.customId === "jump") currentPage = parseInt(i.values[0]);

        await i.update({ 
          embeds: [getEmbed(currentPage)], 
          components: [buttons(), dropdown()] 
        });
      });

      collector.on("end", async () => {
        await message.edit({ components: [] }).catch(() => {});
      });
    });
  }
};