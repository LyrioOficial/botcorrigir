const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    client.setMaxListeners(20);

    const eventsPath = path.join(__dirname, "..", "Eventos");
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));

        if (event.once) {
            client.once(event.name, (...args) => event.run(...args, client));
        } else {
            client.on(event.name, (...args) => event.run(...args, client));
        }
    }

    console.log(`[EVENTOS] Carregados ${eventFiles.length} eventos.`);
};