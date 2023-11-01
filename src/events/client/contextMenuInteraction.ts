import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import { ContextMenuCommandInteraction } from "discord.js";

interface ContextMenuCommand {
    function: (params: {
        interaction: ContextMenuCommandInteraction;
    }) => void;
}

export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction: ContextMenuCommandInteraction) {
        if (!interaction.isContextMenuCommand()) return;

        const command = client.contextMenus.get(interaction.commandName) as ContextMenuCommand;
        if (command) {
            command.function({ interaction });
            log(
                `[Context menu clicked] ${interaction.commandName} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id
                } ${colors.blue("||")} Server: ${interaction.guild!.name}`
            );
        }
    },
} as any;
