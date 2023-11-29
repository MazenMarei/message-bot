import { BaseGuildTextChannel, BitField, ButtonInteraction, GuildTextBasedChannel, Message, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";
import buttonConfig from "../models/button.js";
import {Buffer} from'buffer';

export default {
    id: "customBtnMsg", 
    name : "customBtnMsg",// button custom id here
    permissions: [],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        let getWebhook;
        let BtnData = await buttonConfig.findOne({ID : button.customId })
        if(button.inGuild()) {
            BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId})
            let customchannel =  await buttonConfig.findOne({guildId: button.guildId , sendedMsg : button.message.id})
            getWebhook= (await button.guild.fetchWebhooks()).filter(a => a.id === button.message.webhookId && a.owner.id === button.guild.members.me.id);
            if(customchannel) getWebhook = true
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
            if( !referenceMsg && !getWebhook || !referenceMsg && getWebhook.size == 0) return ;
            
        }
        if(!BtnData) return
        let MessagesData = JSON.parse(Buffer.from( BtnData.data.messaage , "base64").toString())
        if(!MessagesData) return 
        await button.deferUpdate()
        switch (BtnData.data.messageType) {
            case "hide":                
                MessagesData.messages.map(async (msg) => {
                    msg = msg.data
                    await button.followUp({ephemeral : true ,embeds : msg.embeds , content : msg.content , components : msg?.components })
                })
                break;
        
            case "dm":
                MessagesData.messages.map(async (msg) => {
                    msg = msg.data
                    await button.user.send({embeds : msg.embeds , content : msg.content , components : msg?.components })
                    .catch(() => {button.followUp({ephemeral : true , content : `${button.user} \nيرجي فتح خاصك لتتمكن من استلام الرساله`})})
                })
                break;

            case "public":
                MessagesData.messages.map(async (msg) => {
                    msg = msg.data
                    await button.followUp({embeds : msg.embeds , content : msg.content , components : msg?.components })
                })
                break;
            case "room" :
                let channel = await button.guild?.channels?.fetch(BtnData.data.msgChannel).catch(err => false) as BaseGuildTextChannel;
                if(!channel) return;
                MessagesData.messages.map(async (msg) => {
                    msg = msg.data;
                    if(( msg?.embeds?.length == 0 && msg?.content?.length == 0 && msg?.components?.length == 0 && msg?.attachments?.length == 0 ) || (!msg.embeds &&  !msg.content && msg?.attachments?.length == 0)) return;
                    let msgId = await channel.send({embeds : msg?.embeds , content : msg?.content , components : msg?.components })
                    await BtnData.updateOne({sendedMsg : msgId})
                })
                break;

        }                
     
    },
} as any;
