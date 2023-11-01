import {ApplicationCommandType,ComponentEmojiResolvable,MessageContextMenuCommandInteraction, APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType, APIActionRowComponent, APIActionRowComponentTypes, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, Message, ModalSubmitInteraction, ChannelSelectMenuBuilder} from "discord.js";
import { MenuPages } from "../utils/menue.js";
interface value { 
    label: string;
    value: string;
    Description: string;
    Emoji: ComponentEmojiResolvable ,
    default ? : boolean 
  }
export default {
    name: "Add Button",
    id : "Add Button",
    type: ApplicationCommandType.Message,
    function: async function ({ interaction }: { interaction: MessageContextMenuCommandInteraction }) {
        const { client } = await import("../index.js");
        let WebhoockMsg = interaction.targetMessage
        let getWebhook = (await interaction.guild.fetchWebhooks()).filter(a => a.id === WebhoockMsg.webhookId && a.owner.id === interaction.guild.members.me.id);
        let webhookCommandId = (await interaction.guild.commands.fetch({force : true})).filter(a => a.applicationId === interaction.guild.members.me.id && a.name === "webhook").first();
        
        if(!getWebhook || getWebhook.size <= 0 ) return interaction.reply({ephemeral : true,embeds : [new EmbedBuilder().setColor("Red").setDescription(`## **لا يمكني اضافة زر الي هذه الرساله , يجب علي الرساله ان تكون من صنع __ويب هوك__ وان يكون الويب هوك من __صنع البوت__ (يمكنك صنع ويب هوك من صنع البوت عن طريق استخادم </webhook create:${webhookCommandId.id}>)**`)]})
        let MessageRows = WebhoockMsg.components
        if (MessageRows.length >= 5) return interaction.reply({ephemeral : true , embeds : [new EmbedBuilder().setColor("Red").setDescription("## لا يمكنني اضافة المزيد من الازرار وصلت الرساله لحدها الاقصي")]})
        let BtnFunsArray  =[{label : "رابط" ,Description:"لتحديد رابط موقع او رساله" , value :"link" , Emoji:"🌐"},{label : "رتبة" ,Description:"اضافة او حذف رتبة للعضو" , value :"role" , Emoji:"🛡️"},{label : "رساله مخصصة" ,Description:"لاظهار / ارسال رساله في الروم او في الخاص" , value :"msg" , Emoji:"📝"},{label : "ولا شئ" ,Description:"زر للشكل فقط بدون اي وظيفة" , value :"null" , Emoji:"❓"}]

        let menueSub = await MenuPages({ pages: BtnFunsArray, MenuPlaceholder: "اختر وظيفة الزر", message: { ephemeral: true, reply: true, content: "برجاء اختيار وظيفة الزر الذي سيتم اضافتة" ,message : interaction, interaction : interaction as any }, menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false})  as any;
        if(menueSub.timeOut) return
        let menueMsg = menueSub.message as Message
        menueSub.values = menueSub.values.flat().find(a => a.value)
        let Btnprogress = {
            progress : 1,
            "link" : 4,
            "role" : 5,
            "msg" : 6,
            "null" : 4
        }
        let buttonSetupProgressEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription("**"+Btnprogress.progress+".** تحديد وظيفة الزر " + `(${menueSub.values.value === "link" ? "رابط" : menueSub.values.value === "role"? "رتبة" : menueSub.values.value === "msg" ? "رساله خاصة" : "بدون وظيفة"})`)

        let explainEmbed = new EmbedBuilder()
        .setDescription("**اكتب اسم الزر او الايموجي في القائمة المنبثقة  **")
        .setColor("Yellow")

        let ShowDataModalBtn = new ButtonBuilder()
        .setCustomId("Showmodal"+interaction.user.id)
        .setLabel("اظهار القائمة")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
        let ButtonDataModal = new ModalBuilder()
        .setCustomId("ButtonDataModal"+interaction.user.id)
        .setTitle("بينات الزر")
        .addComponents( new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLabel").setLabel("اسم الزر").setPlaceholder("اكتب الكلام الذي تريد اظهاره علي الزر").setStyle(TextInputStyle.Short).setRequired(false)),new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnEmoji").setLabel("اسم الاموجي او الايدي").setPlaceholder("يجب ان يكون الاموجي الخاص موجود بنفس سيرفرات البوت او اموجي عام").setStyle(TextInputStyle.Short).setRequired(false)) )

        let ActionRows = new ActionRowBuilder<ButtonBuilder>().addComponents(ShowDataModalBtn)
        let BtnData = {type : menueSub.values,label : null, Emoji : null,url : null, messaage : null,role : null,messageType : null}
        switch (menueSub.values.value) {
            case "link":
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`)
                explainEmbed.setDescription("**اكتب اسم الزر , الايموجي و الرابط  في القائمة المنبثقة  **")
                ButtonDataModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLink").setLabel("الرابط").setPlaceholder("اكتب الرابط الذي تريد ربطه بالزر").setStyle(TextInputStyle.Paragraph).setRequired(true)))
                Btnprogress.progress++
                break;
            
            case "role" :
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`)
                explainEmbed.setDescription("**حدد الرتبة التي تريد تطبيقها علي هذا الزر من القائمه في الاسفل**")  
                let rolesMenue = await MenuPages({pages: (await interaction.guild.roles.fetch()).map(a => ({ label: a.name, value: a.id  })),MenuPlaceholder: "اختر الرتبة التي تريد اعطائها عن الضغط علي الزر",message: {messageEdit: true,interaction: interaction as any,message: menueMsg,edit: true,content : "" ,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                if(rolesMenue.timeOut) return
                BtnData.role = rolesMenue.values.flat().find(a => a.value).value
                let selectedRole = await interaction.guild.roles.fetch(BtnData.role, {force : true})
                while (selectedRole.position >= interaction.guild.members.me.roles.highest.position) {
                    rolesMenue.interaction.followUp({ephemeral : true, content : `لا يمكنني اعطاء الاعضاء رتبة${selectedRole} اعلي مني او نفس رتبتي , يرجي اختيار رتبة اخري`})
                    rolesMenue = await MenuPages({pages: (await interaction.guild.roles.fetch()).map(a => ({ label: a.name, value: a.id  })),MenuPlaceholder: "اختر الرتبة التي تريد اعطائها عن الضغط علي الزر",message: {messageEdit: true,interaction: interaction as any,message: menueMsg,edit: true,content : "" ,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                    if(rolesMenue.timeOut) return
                    BtnData.role = rolesMenue.values.flat().find(a => a.value).value
                    selectedRole = await interaction.guild.roles.fetch(BtnData.role)
                    if(selectedRole.position < interaction.guild.members.me.roles.highest.position) break;
                }
                Btnprogress.progress ++; 
                let EmbedDescription = buttonSetupProgressEmbed.data.description
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`)
                EmbedDescription += "\n**"+Btnprogress.progress+".**   : تحديد الرتبة" + `(<@&${BtnData?.role?BtnData?.role:"فارغ"}>)`
                buttonSetupProgressEmbed.setDescription(EmbedDescription)
                break;
            case "msg" :
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`)
                explainEmbed.setDescription("**حدد نوع الرساله من القائمة في الاسفل**")
                let messageType = [{label : "مخفية في الروم" , Description : "رساله مخفية يراها من يضغط علي الزر فقط" , Emoji : "👁️" ,value : "hide" } , {label : "عاملة في الروم", Description : "رسالة تكون ظاهر للكل" , value : "public"  , Emoji : "📝"} , {label : "رساله في الخاص" , Description : "يتم ارسال رساله الي خاص العضو" , value : "dm" , Emoji : "✉️"}] as any[]
                let MsgTypeMenue = await MenuPages({pages: messageType,MenuPlaceholder: "حدد نوع الرساله",message: {messageEdit: true,interaction: interaction as any,message: menueMsg,edit: true,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                BtnData.messageType = MsgTypeMenue.values.flat().find(a => a.value)
                break
            default :
            buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`)
            break;
        
        }
        explainEmbed.setDescription("**اكتب اسم الزر , الايموجي في القائمة المنبثقة  **")
        await menueMsg.edit({embeds : [buttonSetupProgressEmbed , explainEmbed ] , components : [ActionRows] , content : ""})  
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`) 
        let getdata = await getBtnData(interaction , menueMsg , ButtonDataModal , BtnData , buttonSetupProgressEmbed , Btnprogress.progress) as any
        Btnprogress.progress = getdata.progress
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type.value]})`)
        explainEmbed.setDescription("**اضغط علي شكل الزر الذي تريد اضافته**")

        let Btn1 = new ButtonBuilder()
        .setCustomId("btn1")
        .setStyle(ButtonStyle.Primary)
        let Btn2 = new ButtonBuilder()
        .setCustomId("btn2")
        .setStyle(ButtonStyle.Secondary)
        let Btn3 = new ButtonBuilder()
        .setCustomId("btn3")
        .setStyle(ButtonStyle.Success)
        let Btn4 = new ButtonBuilder()
        .setCustomId("btn4")
        .setStyle(ButtonStyle.Danger)
        
        if(BtnData.label && BtnData.label.length >= 1){ Btn1.setLabel(BtnData.label);Btn2.setLabel(BtnData.label);Btn3.setLabel(BtnData.label);Btn4.setLabel(BtnData.label);}
        if(BtnData.Emoji && BtnData.Emoji.length >= 1) {Btn1.setEmoji(BtnData.Emoji);Btn2.setEmoji(BtnData.Emoji);Btn3.setEmoji(BtnData.Emoji);Btn4.setEmoji(BtnData.Emoji);}
        
        ActionRows.setComponents(Btn1, Btn2, Btn3,Btn4)

        
        await menueMsg.edit({embeds : [buttonSetupProgressEmbed , explainEmbed ] , components : [ActionRows] , content : ""})  


        


        
    },
} as any;



async function addBtn(interaction , menueMsg) {
    let Filter = (i : ButtonInteraction) => ["Showmodal"+interaction.user.id ].includes(i.customId) && i.user.id === interaction.user.id;
        
    let ShowDataModalBtnCollecoter = menueMsg.createMessageComponentCollector({time : 600000 , filter : Filter})
    return new Promise( async (resolve, reject) => { 
    ShowDataModalBtnCollecoter.on("collect" , async (button : ButtonInteraction) => {

    })
})
}


async function getBtnData(interaction , menueMsg , ButtonDataModal , BtnData , buttonSetupProgressEmbed , progress) {
    let Filter = (i : ButtonInteraction) => ["Showmodal"+interaction.user.id ].includes(i.customId) && i.user.id === interaction.user.id;
        
    let ShowDataModalBtnCollecoter = menueMsg.createMessageComponentCollector({time : 600000 , filter : Filter})
    return new Promise( async (resolve, reject) => { 
    ShowDataModalBtnCollecoter.on("collect" , async (button : ButtonInteraction) => {
        switch (button.customId) {
            case "Showmodal"+interaction.user.id:
                
                let MSg = await button.showModal(ButtonDataModal)
                let Modal = await button.awaitModalSubmit({time : 600000 , filter : i => i.customId === "ButtonDataModal"+interaction.user.id})
                
                if(Modal.fields.fields.filter(a => a.value).size <= 0)  Modal.reply({content : "عليك تقديم اي بينات لايمكن ترك القائمة فارغة", ephemeral : true})

                else {
                    if(Modal.fields?.getField("btnLabel").value.length === 0 && Modal.fields?.getField("btnEmoji").value.length === 0) Modal.reply({content : "عليك تقديم اي بينات  (اسم الزر / سم الاموجي) علي الاقل", ephemeral : true})
                    else {

                    let EmbedDescription = buttonSetupProgressEmbed.data.description

                    BtnData.label = Modal.fields?.getField("btnLabel").value;
                    BtnData.Emoji = Modal.fields?.getField("btnEmoji").value;

                    if(BtnData.type.value  === "link") BtnData.url = Modal.fields?.getField("btnLink").value;
                    else if(BtnData.type.value  === "link" &&validURL(BtnData?.url)=== false) return Modal.reply({content : "يرجي كتابة رابط صالح ", ephemeral : true})
                    else if (BtnData.type.value  === "msg") BtnData.messaage = Modal.fields?.getField("btnMessaage").value;                        

                        await Modal.deferUpdate();
                        progress ++
                        EmbedDescription += "\n**"+progress+".**  : اسم الزر" + `(${BtnData?.label?BtnData.label:"فارغ"})`
                        progress ++
                        EmbedDescription += "\n**"+progress+".**  : الايموجي" + `(${BtnData?.Emoji?BtnData.Emoji:"فارغ"})`
                        
                        
                        if(BtnData.type.value === "link" && BtnData?.url && BtnData?.url.length >= 1) { progress ++; EmbedDescription += "\n**"+progress+".**   : الرابط" + `(${BtnData?.url?BtnData.url:"فارغ"})\n`}
                        buttonSetupProgressEmbed.setDescription(EmbedDescription)
                        ShowDataModalBtnCollecoter.stop();
                        resolve({progress})
                    }
                }
                break;
        }
    })

})
}


function validURL(str:string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }