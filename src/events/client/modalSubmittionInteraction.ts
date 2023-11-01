import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import { ModalSubmitInteraction } from "discord.js";

interface Modal {
    function: (params: {
        client: typeof client;
        interaction: ModalSubmitInteraction;
    }) => void;
}

export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;

        const modal = client.modals.get(interaction.customId) as Modal
        if (!modal) return;

        log(
            `[Modal Submitted] ${interaction.id} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id
            } ${colors.blue("||")} Server: ${interaction.guild!.name}`
        );

        modal.function({ client, interaction });
    },
} as any;
