const app = require("../app");
const client = require("../services/discordClient");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Aguardar o bot estar pronto
    await new Promise((resolve, reject) => {
      if (client.isReady()) {
        resolve();
      } else {
        client.once("ready", () => {
          console.log(`Bot online como: ${client.user.tag}`);
          resolve();
        });

        // Timeout após 30 segundos
        setTimeout(() => {
          reject(new Error("Timeout ao aguardar bot ficar online"));
        }, 30000);
      }
    });

    // Iniciar servidor na porta especificada
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
