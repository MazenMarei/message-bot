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
        let getWebhook = (await button.guild.fetchWebhooks()).filter(a => a.id === button.message.webhookId && a.owner.id === button.guild.members.me.id);
        let BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId})
        let referenceMsg:any;
        if(button.message?.reference?.messageId) {
            let GetMsg = (await button.channel.messages.fetch(button.message?.reference?.messageId))
            let Msg:any = {
                "messages":
                [
                    {"data":{
                        "content":(GetMsg.content.length > 0) ? GetMsg.content : null,
                        "embeds":(GetMsg.embeds.length > 0) ? GetMsg.embeds : null,
                        "attachments":[],
                        "components" : (GetMsg.components.length > 0) ? GetMsg.components : null
                    }}]}
    
            Msg =  JSON.stringify(Msg)
            let bufferMsg = Buffer.from(Msg,"utf-8").toString("base64")   
            
            referenceMsg = (await buttonConfig.find({guildId : button.guildId , type : "msg"})).filter(e => e.data.message == bufferMsg)
           }   
         if( !referenceMsg &&  getWebhook.size == 0 || !getWebhook ) return     
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
