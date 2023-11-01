import config from "../../config.js";
import colors from "colors";
import path from "path";
import { fileURLToPath } from 'url';
import { log, error } from "../../utils/logging.js";
import { client } from "../../index.js";
import { readdirSync, statSync } from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { convertURLs } from "../../utils/windowsUrlConvertor.js";
import { GuildManager } from "discord.js";

interface Command {
	name: string;
	description: string;
	type: number;
	options: any[]; // You can replace "any" with the correct type for options
}

export default {
	name: "ready",
	description: "client ready event",
	once: false,
	function: async function () {
		log(`Logged in as ${colors.red(client.user!.tag)}`);

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		const commands: Command[] = [];

		const registerDir = async (dirName: string) => {
			const COMMAND_DIR = path.resolve(__dirname, `../../${dirName}`);
			const readDir = async (dir: string) => {
				const files = readdirSync(dir);
				for await (const file of files) {
					if (statSync(`${dir}/${file}`).isDirectory()) await readDir(`${dir}/${file}`);
					else {
						const fileToImport = process.platform === "win32" ? `${convertURLs(dir)}/${file}` : `${dir}/${file}`;
						const command = (await import(fileToImport)).default;
						if (command?.name) {
							commands.push({
								name: command.name,
								type: command.type,
								description: command.description || null,
								options: command.options || null
							});
							log(`${dir}/${file} has been registered!`);
						} else {
							error(`${dir}/${file} has no name!`);
						}
					}
				}
			};
			await readDir(COMMAND_DIR);
		};

		await registerDir("slashCommands");
		await registerDir("contextMenus");
		// const rest = new REST({ version: '10' }).setToken(config.token);
		// rest
		// 	.put(Routes.applicationCommands(client.user!.id), { body: commands})
		// 	.then(() => log('Commands have been registered successfully!'))
		// 	.catch((err) => console.log(err));
		let guiilds = await client.guilds.fetch()
		for (let guildNum of guiilds) {
			let guild = await client.guilds.fetch(guildNum[0]);
			guild.commands.set(commands).catch((err) => console.log(err));
		}
		log('Commands have been registered successfully!')
	},
} as any;