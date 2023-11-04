import { BitField, ButtonInteraction, GuildTextBasedChannel, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";
import buttonConfig from "../models/button.js";
import {Buffer} from'buffer';

export default {
    id: "customBtnRole", 
    name : "customBtnRole",// button custom id here
    permissions: [],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        let BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId, message : button.message.id})
        if(!BtnData) return
        let Role = await button.guild.roles.fetch(BtnData.data.role)
        if(!Role) return await button.deferUpdate()
        let added = false
        let user = (await button.guild.members.fetch(button.user.id))
        let userHasRole = user.roles.cache.has(Role.id)
        if(userHasRole)  await user.roles.remove(Role)      
        else {await user.roles.add(Role); added = true; }
        await button.deferUpdate()
        await button.followUp({ephemeral : true , content : `${added?"➕":"➖"} | تم ${added?"اعطائك":"حذف منك"} رتبة ${Role} بنجاح 😋`})
    },
} as any;
