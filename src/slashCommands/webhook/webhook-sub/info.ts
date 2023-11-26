import { APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType, APIActionRowComponent, APIActionRowComponentTypes} from "discord.js";
import Buffer from'buffer';
import buttonInteraction from "../../../events/client/buttonInteraction.js";


export default {
    function : async function({ interaction }: { interaction: ChatInputCommandInteraction }) {
        let webhookId = interaction.options.getString("webhook")
        let getWebhook = (await interaction.guild.fetchWebhooks()).filter(a => a.id === webhookId)
        if(getWebhook.size <= 0) return interaction.reply({ephemeral : true,embeds : [new EmbedBuilder().setColor("Blurple").setDescription("لم يتم العثور علي هذا الويب الرجاء اختيار احد الاختيارات من القائمه")]})
        let webhook = getWebhook.first()
        let infoEmbed = new EmbedBuilder()
        .setTitle("معلومات الويب هوك 🪪")
        .setFields({name : "> الاسم : " , value : webhook.name , inline : true},
         {name : "> الروم: " , value : `<#${webhook.channel.id}>` , inline : true},
         {name : "> 🆔: " , value : webhook.id , inline : true},
         {name : "> تم انشاء بواسطه" , value : `<@${webhook.owner.id}>` , inline : true},
         {name : "> تم انشاء بتاريخ" , value : `<t:${Math.ceil(Date.parse(webhook.createdAt.toISOString()) /1000)}:R>` , inline : true})
        .setColor("Aqua")
        .setThumbnail(webhook.avatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png")
         let urlBtn = new ButtonBuilder()
         .setCustomId("urlBtn")
         .setLabel("الرابط")
         .setStyle(ButtonStyle.Primary)

        let urlAction = new ActionRowBuilder<ButtonBuilder>().setComponents(urlBtn)
        let InfoMsg = await interaction.reply({ephemeral : true , embeds : [infoEmbed] , components : [urlAction] })

        let btnCollector = InfoMsg.createMessageComponentCollector({time : 600000,filter : i => ["secret-url","urlBtn"].includes(i.customId)})
        try {
            btnCollector.on("collect" , async buttonInteraction => {

                switch (buttonInteraction.customId) {
                    case "urlBtn":
                        let webhook2 = getWebhook.first()
                        let urlDescription;
                        if(webhook2.owner.bot) urlDescription = `\n\n\n> **ℹ️ الاستخدام :** \n\n يمكنك استخدام هذا الويب هوك لارسال الرسائل عن طريق موقع \`Discohook\` بعد ارسال رساله عن طريق الموقع لن يمكنك اضافة الازرار الي الرسالة \n**او عن طريق او أوامر البوت **و يمكنك اضافة ازرا والتحكم بها ايضا\n\n> **⛔ خطر: **\n\nيمكن لاي احد ارسال الرسائل عن طريق رابط الويب هوك \`احفظ هذا الرابط سراً\``
                        else urlDescription =  "\n\n\n> **⛔ خطر: **\n\nيمكن لاي احد ارسال الرسائل عن طريق رابط الويب هوك `احفظ هذا الرابط سراً`"
                        let urlEMbed = new EmbedBuilder().setColor("Aqua").setTitle("رابط الويب هوك").setDescription(urlDescription)
                        let url = `https://discohook.app/?data=${Buffer.Buffer.from(`{"messages":[{"data":{"content":null,"embeds":null}}],"targets":[{"url":"${webhook2.url}"}]}`).toString("base64")}`
                        let DiscohookBtn = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("فتح موقع Discohook").setURL(url)
                        let UrlBtn = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("secret-url").setLabel("اظهار رابط الويب هوك لمدة 15 ثانية")
                        let BtnAction = new ActionRowBuilder<ButtonBuilder>().addComponents(DiscohookBtn ,UrlBtn )
                        let UrlMsg = await buttonInteraction.reply({ephemeral : true,embeds : [urlEMbed] , components : [BtnAction]})
                        break;
                    case "secret-url" :
                        let webhook3 = getWebhook.first()
                         await buttonInteraction.reply({ephemeral : true , content : webhook3.url.toString()}).then((a) => {setTimeout(() => { a.delete().catch(error => false)}, 15000); })
        
                        break;
                }
            })
        } catch (error) {
            null;
        }
    btnCollector.on("end", async () => {await InfoMsg.edit({embeds : [] , components : [] , content : "انتهت مهلة الانتظار"}).catch(err => null)})
    }
}