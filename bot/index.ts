import path from "path";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  const ENV_FILE = path.join(__dirname, ".env.teamsfx.local");
  dotenv.config({ path: ENV_FILE });
}

// DbConnection proof of concept
import DbConnection from "./utilities/Db";
(async function TestDbConnection() {
  const sqlConfig = {
    user: process.env.SQL_USER_NAME,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE_NAME,
    server: process.env.SQL_ENDPOINT,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: false, // change to true for local dev / self-signed certs
    },
  };

  const db = new DbConnection();
  await db.connect(sqlConfig);

  // Show initial db
  console.log("Initial db contents");
  console.log(await db.select());
  console.log("\n\n\n");

  console.log("Inserting Jerry");
  console.log(await db.insert("Jerry"));
  console.log(await db.select());
  console.log("\n\n\n");

  // Rename Jerry to Steve
  console.log("Renaming Jerry to Steve");
  const dbContents = await db.select();
  const jerryIndex = dbContents.recordset.find(
    (record) => record.name == "Jerry"
  ).id;
  console.log(await db.update(jerryIndex, "Steve"));
  console.log(await db.select());
  console.log("\n\n\n");

  // Delete Steve from db
  console.log("Deleting Steve");
  console.log(await db.delete("Steve"));
  console.log(await db.select());
  console.log("\n\n\n");

  console.log("Closing db");
  db.pool.close();
})();

// Import required packages
import * as restify from "restify";

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, TurnContext } from "botbuilder";

// This bot's main dialog.
import { TeamsBot } from "./teamsBot";

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
  appId: process.env.BOT_ID,
  appPassword: process.env.BOT_PASSWORD,
});

// Catch-all for errors.
const onTurnErrorHandler = async (context: TurnContext, error: Error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity(
    `The bot encountered unhandled error:\n ${error.message}`
  );
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the bot that will handle incoming messages.
const bot = new TeamsBot();

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});
