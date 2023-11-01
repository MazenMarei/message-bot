// Package imports
import config from "./config.js";
import { error } from "./utils/logging.js";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import  mongoose  from "mongoose"
// Define a new class that extends Client
class CustomClient extends Client {
    cooldowns: any[] = [];
    userData : Collection<String , any> = new Collection()
    commands: Collection<String, any> = new Collection();
    slashCommands: Collection<String, any> = new Collection();
    selectMenus: Collection<String, any> = new Collection();
    modals: Collection<String, any> = new Collection();
    contextMenus: Collection<String, any> = new Collection();
    buttons: Collection<String, any> = new Collection();
    menuuser: Collection<unknown, unknown>;
}

// Initialize the extended client
export const client = new CustomClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ,GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.GuildMember, Partials.Channel, Partials.Reaction, Partials.User]
});

// Command & event handlers
import eventHandler from "./handlers/eventHandler.js";
import idkHowToCallThisHandler from "./handlers/idkHowToCallThisHandler.js";

await idkHowToCallThisHandler.init();
eventHandler.function();

// Catching all the errors
process.on("uncaughtException", config.debugMode ? console.error : error);
process.on("unhandledRejection", config.debugMode ? console.error : error); 

client.login(config.token);
mongoose.connect(config.Mongoose, )