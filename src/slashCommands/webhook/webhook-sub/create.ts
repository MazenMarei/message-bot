import { APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType} from "discord.js";
import Buffer from'buffer';


export default {
    function : async function({ interaction }: { interaction: ChatInputCommandInteraction }) {
        let webhook = {
            name : interaction.options.getString("name"),
            channel : interaction.options.getChannel("channel") || interaction.channel,
            avatar : interaction.options.getAttachment("avatar")?.url || undefined
        } as any

        let createdweb = await interaction.guild.channels.createWebhook(webhook)
        let url = `https://discohook.app/?data=${Buffer.Buffer.from(`{"messages":[{"data":{"content":null,"embeds":null}}],"targets":[{"url":"${createdweb.url}"}]}`).toString("base64")}`

        let doneEmbed = new EmbedBuilder().setColor("Aqua").setTitle("تم انشاء الويب هوك").setDescription("> **ℹ️ الاستخدام :** \n\n يمكنك استخدام هذا الويب هوك لارسال الرسائل عن طريق موقع `Discohook` بعد ارسال رساله عن طريق الموقع لن يمكنك اضافة الازرار الي الرسالة \n**او عن طريق او أوامر البوت **و يمكنك اضافة ازرا والتحكم بها ايضا\n\n> **⛔ خطر: **\n\nيمكن لاي احد ارسال الرسائل عن طريق رابط الويب هوك `احفظ هذا الرابط سراً`")
        let DiscohookBtn = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("فتح موقع Discohook").setURL(url)
        let UrlBtn = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId("secret-url").setLabel("اظهار رابط الويب هوك لمدة 15 ثانية")
        let BtnAction = new ActionRowBuilder<ButtonBuilder>().addComponents(DiscohookBtn ,UrlBtn )
        let Msg = await interaction.reply({ephemeral : true , embeds : [doneEmbed] , components : [BtnAction]})
        let BtnCollector =  Msg.createMessageComponentCollector<MessageComponentType>({time : 60000 , filter : i =>["secret-url","urlBtn"].includes(i.customId)})
        BtnCollector.on("collect" , async (ButtonInteraction:ButtonInteraction) => {let UrlMsg = await ButtonInteraction.reply({ephemeral : true , content : createdweb.url.toString()}).then((a) => {setTimeout(() => { a.delete().catch(error => false)}, 15000); })})
        BtnCollector.on("end", async () => {await Msg.edit({embeds : [] , components : [] , content : "انتهت مهلة الانتظار"}).catch(err => null)})
    }

}