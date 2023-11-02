import { BitField, ButtonInteraction, GuildTextBasedChannel, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";

export default {
    id: "customBtnNull", 
    name : "customBtnNull",// button custom id here
    permissions: [],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        await button.deferUpdate(); 
    },
} as any;
