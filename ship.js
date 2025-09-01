const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Cheque se alguém é sua alma gêmea")
    .addUserOption(option =>
      option.setName("usuario1")
        .setDescription("Primeiro usuário a shippar")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("usuario2")
        .setDescription("Segundo usuário a shippar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario1 = interaction.options.getUser("usuario1");
    const usuario2 = interaction.options.getUser("usuario2");

    const porcentagem = Math.floor(Math.random() * 101);

    // Criando o nome ship
    const metade1 = usuario1.username.slice(0, Math.floor(usuario1.username.length / 2));
    const metade2 = usuario2.username.slice(Math.floor(usuario2.username.length / 2));
    const nomeship = metade1 + metade2;

    // Criando canvas
    const canvas = Canvas.createCanvas(500, 280);
    const ctx = canvas.getContext("2d");

    // Fundo
    ctx.fillStyle = "#383838";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatares
    const avatar1 = await Canvas.loadImage(usuario1.displayAvatarURL({ extension: "png", size: 256 }));
    const avatar2 = await Canvas.loadImage(usuario2.displayAvatarURL({ extension: "png", size: 256 }));
    ctx.drawImage(avatar1, 0, 0, 250, 250);
    ctx.drawImage(avatar2, 250, 0, 250, 250);

    // Barra de porcentagem
    ctx.fillStyle = "#cf0d30";
    const barraLargura = (porcentagem / 100) * 500;
    ctx.beginPath();
    ctx.roundRect(0, 250, barraLargura, 30, 5);
    ctx.fill();

    // Texto da porcentagem
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${porcentagem}%`, 230, 270);

    // Mensagem extra
    let mensagem_extra;
    if (porcentagem <= 35) {
      mensagem_extra = "😅 Não parece rolar uma química tão grande, mas quem sabe...?";
    } else if (porcentagem <= 65) {
      mensagem_extra = "☺️ Essa combinação tem potencial, que tal um jantar romântico?";
    } else {
      mensagem_extra = "😍 Combinação perfeita! Quando será o casamento?";
    }

    // Finalizando
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "ship.png" });

    await interaction.reply({
      content: `<:loverio:1043614627864514741> **Será que vamos ter um casal novo por aqui?** <:loverio:1043614627864514741>\n<:RioAlphaTester:1009529311029633024> ${usuario1} + ${usuario2} = ✨ \`${nomeship}\` ✨\n${mensagem_extra}`,
      files: [attachment]
    });
  }
};