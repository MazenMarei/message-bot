import { ApplicationCommandType , MessageContextMenuCommandInteraction} from "discord.js";

export default {
    name: "Manage  Button",
    id : "Manage Button",
    type: ApplicationCommandType.Message,
    function: async function ({ interaction }: { interaction: MessageContextMenuCommandInteraction }) {
        const { client } = await import("../index.js");
        console.log(await interaction.targetMessage.fetchWebhook().catch(err => false))
        interaction.reply("Mange")
    },
} as any;