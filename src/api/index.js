const app = require("../app");
const client = require("../services/discordClient");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Aguardar o bot estar pronto
    console.log("Iniciando bot...");

    await new Promise((resolve, reject) => {
      // Se o bot já estiver pronto
      if (client.isReady()) {
        console.log("Bot já está online");
        resolve();
      } else {
        // Aguardar evento ready
        console.log("Aguardando bot ficar online...");

        // Timeout de 30 segundos
        const timeout = setTimeout(() => {
          reject(new Error("Timeout ao aguardar bot"));
        }, 30000);

        client.once("ready", () => {
          console.log(`Bot online como: ${client.user.tag}`);
          clearTimeout(timeout);
          resolve();
        });
      }
    });

    // Iniciar servidor Express
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;
