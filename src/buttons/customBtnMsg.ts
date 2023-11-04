import { BitField, ButtonInteraction, GuildTextBasedChannel, Message, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";
import buttonConfig from "../models/button.js";
import {Buffer} from'buffer';

export default {
    id: "customBtnMsg", 
    name : "customBtnMsg",// button custom id here
    permissions: [],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        let BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId, message : button.message.id})
        if(!BtnData) return
        let MessagesData =JSON.parse(Buffer.from( BtnData.data.messaage , "base64").toString())
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
        }                
     
    },
} as any;
