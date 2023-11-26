import { BitField, ButtonInteraction, GuildTextBasedChannel, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";
import buttonConfig from "../models/button.js";

export default {
    id: "customBtnNull", 
    name : "customBtnNull",// button custom id here
    permissions: [],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        let getWebhook;
        let BtnData = await buttonConfig.findOne({ID : button.customId })
        if(button.inGuild()) {
            BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId})
            getWebhook= (await button.guild.fetchWebhooks()).filter(a => a.id === button.message.webhookId && a.owner.id === button.guild.members.me.id);
            let referenceMsg:any;
            if(button.message?.reference?.messageId) {
                try {
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
                } catch (error) {
                    null
                }
               } 
            if( !referenceMsg && !getWebhook || !referenceMsg && getWebhook.size == 0) return 
        }
        if(!BtnData) return
        await button.deferUpdate()
        },
} as any;
