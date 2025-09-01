// ComandosSlash/serverinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Mostra informações detalhadas do servidor."),

  async execute(interaction) {
    const { guild } = interaction;

    const dono = await guild.fetchOwner();
    const totalMembros = guild.memberCount;
    const canaisTexto = guild.channels.cache.filter(c => c.type === 0).size;
    const canaisVoz = guild.channels.cache.filter(c => c.type === 2).size;
    const categorias = guild.channels.cache.filter(c => c.type === 4).size;
    const cargos = guild.roles.cache.size;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c) // vermelho bonito
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
      })
      .setTitle("🌐 Informações do Servidor")
      .setDescription(`Aqui estão os detalhes mais importantes sobre **${guild.name}**:`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "👑 Dono", value: `${dono.user.tag}`, inline: true },
        { name: "🆔 ID", value: `${guild.id}`, inline: true },
        { name: "📆 Criado em", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: "👥 Membros", value: `**${totalMembros}**`, inline: true },
        { name: "💬 Texto", value: `${canaisTexto}`, inline: true },
        { name: "🔊 Voz", value: `${canaisVoz}`, inline: true },
        { name: "📂 Categorias", value: `${categorias}`, inline: true },
        { name: "🎭 Cargos", value: `${cargos}`, inline: true }
      )
      .setImage(guild.bannerURL({ size: 1024 }) || guild.splashURL({ size: 1024 }) || null)
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};