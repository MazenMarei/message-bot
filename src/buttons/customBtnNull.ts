import { BitField, ButtonInteraction, GuildTextBasedChannel, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";
import buttonConfig from "../models/button.js";

export default {
    id: "customBtnNull", 
    name : "customBtnNull",// button custom id here
    permissions: [],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        let BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId, message : button.message.id})
        if(!BtnData) return
        },
} as any;
