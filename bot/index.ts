// Load environment variables from file if not in prod
import 'reflect-metadata'; // We need this in order to use @Decorators
import path from 'path';
import dotenv from 'dotenv';
import typeormLoader from './loaders/typeorm';
if (process.env.NODE_ENV !== 'production') {
    const ENV_FILE = path.join(__dirname, '.env.teamsfx.local');
    dotenv.config({ path: ENV_FILE });
}

// Import required packages
import * as restify from 'restify';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, ConsoleTranscriptLogger, TestAdapter, TurnContext } from 'botbuilder';

// This bot's main dialog.
import { TeamsBot } from './teamsBot';

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
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity(`The bot encountered unhandled error:\n ${error.message}`);
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;
let bot: TeamsBot;
(async function () {
    const conn = await typeormLoader();
    bot = new TeamsBot(conn);
    const server = restify.createServer();
    
    server.listen(process.env.port || process.env.PORT || 3978, async () => {
        try {
            console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
        } catch (e) {
            console.log(e);
        }
    });
    server.post('/api/messages', async (req, res) => {
        await adapter.processActivity(req, res, async (context) => {
            await bot.run(context);
        });
    });
})();
// Create the bot that will handle incoming messages.

// Create HTTP server.

// Listen for incoming requests.
