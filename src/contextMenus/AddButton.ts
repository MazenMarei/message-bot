import {ApplicationCommandType,ComponentEmojiResolvable,MessageContextMenuCommandInteraction, APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType, APIActionRowComponent, APIActionRowComponentTypes, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, Message, ModalSubmitInteraction, ChannelSelectMenuBuilder, ActionRow} from "discord.js";
import { MenuPages } from "../utils/menue.js";
import {Buffer} from'buffer';
import button from "../models/button.js";
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
    function: async function ({ interaction }: { interaction: MessageContextMenuCommandInteraction , Msg  : any }) {
        const { client } = await import("../index.js");

        let WebhoockMsg = interaction?.targetMessage 
        let getWebhook = (await interaction.guild.fetchWebhooks()).filter(a => a.id === WebhoockMsg.webhookId && a.owner.id === interaction.guild.members.me.id);
        let webhookCommandId = (await interaction.guild.commands.fetch({force : true})).filter(a => a.applicationId === interaction.guild.members.me.id && a.name === "webhook").first();
        
        let Max = false;
        WebhoockMsg.components.map((a,i) => {if(i+1 === 5 && WebhoockMsg.components.length ===  5 && a.components.length == 5) Max = true;})
        if(!interaction.replied) await interaction.deferReply({ephemeral : true});
        if(Max) return interaction.editReply({ content : "وصلت الرساله حدها الاقصي من الازرار"}).catch(err => null);
        if(!getWebhook || getWebhook.size <= 0 ) return interaction.editReply({embeds : [new EmbedBuilder().setColor("Red").setDescription(`## **لا يمكني اضافة زر الي هذه الرساله , يجب علي الرساله ان تكون من صنع __ويب هوك__ وان يكون الويب هوك من __صنع البوت__ (يمكنك صنع ويب هوك من صنع البوت عن طريق استخادم </webhook create:${webhookCommandId.id}>)**`)]}).catch(err => null)
        let MessageRows = WebhoockMsg.components
        if (MessageRows.length >= 5 && MessageRows[4].components.length >= 5) return interaction.editReply({ embeds : [new EmbedBuilder().setColor("Red").setDescription("## لا يمكنني اضافة المزيد من الازرار وصلت الرساله لحدها الاقصي")]}).catch(err => null)
        let BtnFunsArray  =[{label : "رابط" ,Description:"لتحديد رابط موقع او رساله" , value :"link" , Emoji:"🌐"},{label : "رتبة" ,Description:"اضافة او حذف رتبة للعضو" , value :"role" , Emoji:"🛡️"},{label : "رساله مخصصة" ,Description:"لاظهار / ارسال رساله في الروم او في الخاص" , value :"msg" , Emoji:"📝"},{label : "ولا شئ" ,Description:"زر للشكل فقط بدون اي وظيفة" , value :"null" , Emoji:"❓"}]
        
        let menueSub = await MenuPages({ pages: BtnFunsArray, MenuPlaceholder: "اختر وظيفة الزر", message: {  editReply: true, content: "برجاء اختيار وظيفة الزر الذي سيتم اضافتة" ,message : interaction, interaction : interaction as any , embeds : []}, menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false})  as any;
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
        .addComponents( new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLabel").setLabel("اسم الزر").setPlaceholder("اكتب الكلام الذي تريد اظهاره علي الزر").setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(80)),new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnEmoji").setLabel("اسم الاموجي او الايدي").setPlaceholder("يجب ان يكون الاموجي الخاص موجود بنفس سيرفرات البوت او اموجي عام").setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(80)) )

        let ActionRows = new ActionRowBuilder<ButtonBuilder>().addComponents(ShowDataModalBtn)
        let BtnData = {type : menueSub.values.value,label : null, Emoji : null,url : null, messaage : null,role : null,messageType : null ,style : null}
        switch (menueSub.values.value) {
            case "link":
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                explainEmbed.setDescription("**اكتب اسم الزر , الايموجي و الرابط  في القائمة المنبثقة  **")
                ButtonDataModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLink").setLabel("الرابط").setPlaceholder("اكتب الرابط الذي تريد ربطه بالزر").setStyle(TextInputStyle.Paragraph).setRequired(true)))
                break;
            
            case "role" :
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                explainEmbed.setDescription("**حدد الرتبة التي تريد تطبيقها علي هذا الزر من القائمه في الاسفل**")  
                let rolesMenue = await MenuPages({pages: (await interaction.guild.roles.fetch()).map(a => ({ label: a.name, value: a.id  })),MenuPlaceholder: "اختر الرتبة التي تريد اعطائها عن الضغط علي الزر",message: {editReply : true,interaction: interaction as any,message: interaction,content : "" ,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                if(rolesMenue.timeOut) return
                BtnData.role = rolesMenue.values.flat().find(a => a.value).value
                let selectedRole = await interaction.guild.roles.fetch(BtnData.role, {force : true})
                while (selectedRole.position >= interaction.guild.members.me.roles.highest.position) {
                    rolesMenue.interaction.followUp({ephemeral : true, content : `لا يمكنني اعطاء الاعضاء رتبة${selectedRole} اعلي مني او نفس رتبتي , يرجي اختيار رتبة اخري`}).catch(err => null)
                    rolesMenue = await MenuPages({pages: (await interaction.guild.roles.fetch()).map(a => ({ label: a.name, value: a.id  })),MenuPlaceholder: "اختر الرتبة التي تريد اعطائها عن الضغط علي الزر",message: {editReply : true,interaction: interaction as any,message: interaction,content : "" ,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                    if(rolesMenue.timeOut) return
                    BtnData.role = rolesMenue.values.flat().find(a => a.value).value
                    selectedRole = await interaction.guild.roles.fetch(BtnData.role)
                    if(selectedRole.position < interaction.guild.members.me.roles.highest.position) break;
                }
                Btnprogress.progress ++; 
                let EmbedDescription = buttonSetupProgressEmbed.data.description
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                EmbedDescription += "\n**"+Btnprogress.progress+".**   : تحديد الرتبة" + `(<@&${BtnData?.role?BtnData?.role:"فارغ"}>)`
                buttonSetupProgressEmbed.setDescription(EmbedDescription)
                break;
            case "msg" :
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                explainEmbed.setDescription("**حدد نوع الرساله من القائمة في الاسفل**")
                let messageType = [{label : "مخفية في الروم" , Description : "رساله مخفية يراها من يضغط علي الزر فقط" , Emoji : "👁️" ,value : "hide" } , {label : "عامة في الروم", Description : "رسالة تكون ظاهر للكل" , value : "public"  , Emoji : "📝"} , {label : "رساله في الخاص" , Description : "يتم ارسال رساله الي خاص العضو" , value : "dm" , Emoji : "✉️"}] as any[]
                let MsgTypeMenue = await MenuPages({pages: messageType,MenuPlaceholder: "حدد نوع الرساله",message: {editReply: true,interaction: interaction as any,message: interaction,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                BtnData.messageType = MsgTypeMenue.values.flat().find(a => a.value).value
                Btnprogress.progress ++; 
                let EmbedDescriptions = buttonSetupProgressEmbed.data.description
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                EmbedDescriptions += "\n**"+Btnprogress.progress+".**   :  نوع الرساله" + `(${messageType.find(a => a.value === BtnData.messageType) .label })`
                buttonSetupProgressEmbed.setDescription(EmbedDescriptions)

                ButtonDataModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnMessaage").setLabel("رابط الرساله").setPlaceholder("اكتب رابط الرساله من موقع https://discohook.org/?data او https://share.discohook.app/go/").setStyle(TextInputStyle.Paragraph).setRequired(true)))
                break
            default :
            buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
            break;
        
        }
        explainEmbed.setDescription("**اكتب اسم الزر , الايموجي في القائمة المنبثقة  **")
        if(BtnData.type === "link") explainEmbed.setDescription("**اكتب اسم الزر , الايموجي والرابط في القائمة المنبثقة  **")
        if(BtnData.type === "msg") explainEmbed.setDescription("**اكتب اسم الزر , الايموجي والرابط الرساله من الموقع في القائمة المنبثقة  **")
        await interaction.editReply({embeds : [buttonSetupProgressEmbed , explainEmbed ] , components : [ActionRows] , content : ""}).catch(err => null)
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`) 
        let getdata = await getBtnData(interaction , menueMsg , ButtonDataModal , BtnData , buttonSetupProgressEmbed , Btnprogress.progress) as any
        Btnprogress.progress = getdata.progress
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
        explainEmbed.setDescription("**اضغط علي شكل الزر الذي تريد اضافته**")

        let Btn1 = new ButtonBuilder()
        .setCustomId("Primary"+interaction.user.id)
        .setStyle(ButtonStyle.Primary)
        let Btn2 = new ButtonBuilder()
        .setCustomId("Secondary"+interaction.user.id)
        .setStyle(ButtonStyle.Secondary)
        let Btn3 = new ButtonBuilder()
        .setCustomId("Success"+interaction.user.id)
        .setStyle(ButtonStyle.Success)
        let Btn4 = new ButtonBuilder()
        .setCustomId("Danger"+interaction.user.id)
        .setStyle(ButtonStyle.Danger)
        
        if(BtnData.label && BtnData.label.length >= 1){ Btn1.setLabel(BtnData.label);Btn2.setLabel(BtnData.label);Btn3.setLabel(BtnData.label);Btn4.setLabel(BtnData.label);}
        if(BtnData.Emoji && BtnData.Emoji.length >= 1) {Btn1.setEmoji(BtnData.Emoji);Btn2.setEmoji(BtnData.Emoji);Btn3.setEmoji(BtnData.Emoji);Btn4.setEmoji(BtnData.Emoji);}
        
        ActionRows.setComponents(Btn1, Btn2, Btn3,Btn4)

        await interaction.editReply({embeds : [buttonSetupProgressEmbed , explainEmbed ] , content : ""}).catch(err => null)
        if(BtnData.type !== "link") { 
            await interaction.editReply({ components : [ActionRows] , content : ""}).catch(err => null)
            let choseBtns = await choseBtn(interaction , menueMsg , BtnData , Btnprogress.progress) as any
            Btnprogress.progress =  choseBtns.progress
             BtnData = choseBtns.BtnData
        } else   await interaction.editReply({embeds : [buttonSetupProgressEmbed  ] ,components : [] , content : ""}).catch(err => null) ;
        
        let {customID , BtnIndex} = await addBtn(getWebhook , WebhoockMsg , BtnData, Btnprogress.progress , buttonSetupProgressEmbed) as any
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
        let EmbedDescription = buttonSetupProgressEmbed.data.description
        let BtnStyles = {1 : "بنفسجي" , 2 : "رمادي" , 3 : "اخضر" , 4 : "احمر",5 : "رمادي يتفاعل مع رابط"}
        EmbedDescription += "\n**"+Btnprogress.progress+".**  : شكل الزر " + `(${BtnStyles[BtnData.style?BtnData.style:5]})`
        buttonSetupProgressEmbed.setDescription(EmbedDescription)
        let saveButtonData = await button.create({guildId : interaction.guildId , ID : customID , data : BtnData , message : WebhoockMsg.id , webhook : getWebhook.first().id , btnID : BtnIndex , type : BtnData?.type})
        let addAnother = new ButtonBuilder()
        .setCustomId("addAnother")
        .setLabel("اضف زر اخر")
        .setStyle(ButtonStyle.Primary)
        let ActionAdd = new ActionRowBuilder<ButtonBuilder>().addComponents(addAnother)
        buttonSetupProgressEmbed.addFields({name : "> ID : " , value : `${BtnIndex}` , inline : true } ,{name : "> custom ID : " , value : `${customID}` , inline: true})  
        menueMsg =  await interaction.editReply({embeds : [buttonSetupProgressEmbed  ] ,components : [ActionAdd] , content : ""}).catch(err => null)  
        let AnotherCollector = menueMsg.createMessageComponentCollector({filter : i=> i.user.id === interaction.user.id && i.customId === "addAnother", time : 1800000 , componentType : ComponentType.Button})
       try {
        AnotherCollector.on("collect" , async (button : ButtonInteraction) => {
            await button.deferUpdate().catch(err => null)
            await this.function({ interaction   }); 
        })
       } catch (error) {
        null;
       }

        
        AnotherCollector.on("end" ,  async (button : ButtonInteraction) => {
            await interaction.editReply({content : "انتهي وقت استخدام الامر" , embeds : [], components : []}).catch(err => null)
        })
        
    },
} as any;



async function addBtn(getWebhook , WebhoockMsg : Message , BtnData , progress , buttonSetupProgressEmbed  ) {
    let ActionRows = WebhoockMsg.components
    let BtnAdded = false
    let components = []
    let BtnIndex = (await button.find({guildId : WebhoockMsg.guildId})).length
    let customID:string
    if(ActionRows.length > 0 && ActionRows.length <= 5) {
        for (let ActionRow  of ActionRows) {    
            if(ActionRow.components.length === 5) components.push(ActionRow) 
            else {         
            BtnIndex++
            let Btn = new ButtonBuilder()
            if(BtnData.type === "link") {Btn.setStyle(ButtonStyle.Link).setURL(BtnData.url); customID = "UrlBtn"+BtnIndex}
            else if(BtnData.type === "msg") { Btn.setCustomId("customBtnMsg"+BtnIndex); customID = "customBtnMsg"+BtnIndex}
            else if(BtnData.type === "null") {Btn.setCustomId("customBtnNull"+BtnIndex); customID = "customBtnNull"+BtnIndex}
            else if(BtnData.type === "role") {Btn.setCustomId("customBtnRole"+BtnIndex); customID = "customBtnRole"+BtnIndex;}
    
            if(BtnData.type !== "link") Btn.setStyle(BtnData.style)
            if(BtnData.label && BtnData.label.length >= 1) Btn.setLabel(BtnData.label)
            if(BtnData.Emoji && BtnData.Emoji.length >= 1) Btn.setEmoji(BtnData.Emoji)
            let buttons = ActionRow.components  
            if(!BtnAdded) {buttons.push(Btn as any);ActionRow = new ActionRowBuilder<ButtonBuilder>(  ActionRow as any ).setComponents(buttons as any) as any;BtnAdded =true}             
            components.push(ActionRow)
        }

        }        
        if(!BtnAdded) {
            BtnIndex++
            let Btn = new ButtonBuilder()
            if(BtnData.type === "link") {Btn.setStyle(ButtonStyle.Link).setURL(BtnData.url); customID = "UrlBtn"+BtnIndex}
            else if(BtnData.type === "msg") { Btn.setCustomId("customBtnMsg"+BtnIndex); customID = "customBtnMsg"+BtnIndex}
            else if(BtnData.type === "null") {Btn.setCustomId("customBtnNull"+BtnIndex); customID = "customBtnNull"+BtnIndex}
            else if(BtnData.type === "role") {Btn.setCustomId("customBtnRole"+BtnIndex); customID = "customBtnRole"+BtnIndex;}
    
            if(BtnData.type !== "link") Btn.setStyle(BtnData.style)
            if(BtnData.label && BtnData.label.length >= 1) Btn.setLabel(BtnData.label)
            if(BtnData.Emoji && BtnData.Emoji.length >= 1) Btn.setEmoji(BtnData.Emoji)
            let ActionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(Btn)
            BtnAdded =true
            components.push(ActionRow)
        }
    } else {
            let Btn = new ButtonBuilder()
            BtnIndex++
            if(BtnData.type === "link") {Btn.setStyle(ButtonStyle.Link).setURL(BtnData.url); customID = "UrlBtn"+BtnIndex}
            else if(BtnData.type === "msg") { Btn.setCustomId("customBtnMsg"+BtnIndex); customID = "customBtnMsg"+BtnIndex}
            else if(BtnData.type === "null") {Btn.setCustomId("customBtnNull"+BtnIndex); customID = "customBtnNull"+BtnIndex}
            else if(BtnData.type === "role") {Btn.setCustomId("customBtnRole"+BtnIndex); customID = "customBtnRole"+BtnIndex;}
    
            if(BtnData.type !== "link") Btn.setStyle(BtnData.style)
            if(BtnData.label && BtnData.label.length >= 1) Btn.setLabel(BtnData.label)
            if(BtnData.Emoji && BtnData.Emoji.length >= 1) Btn.setEmoji(BtnData.Emoji)
            
            let ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(Btn)
            components.push(ActionRow)
    }

   await getWebhook.first().editMessage(WebhoockMsg , {components : components}).catch(err => null)
   return {customID , BtnIndex}
    
}



async function choseBtn(interaction , menueMsg , BtnData , progress) {
    let Filter = (i : ButtonInteraction) => ["Primary"+interaction.user.id,"Secondary"+interaction.user.id,"Success"+interaction.user.id,"Danger"+interaction.user.id ].includes(i.customId) && i.user.id === interaction.user.id;
        
    let ShowDataModalBtnCollecoter = menueMsg.createMessageComponentCollector({time : 600000 , filter : Filter})
    return new Promise( async (resolve, reject) => { 
    ShowDataModalBtnCollecoter.on("collect" , async (button : ButtonInteraction) => {
        switch (button.customId) {
            case "Primary"+interaction.user.id:
                await button.deferUpdate().catch(err => null)
                BtnData.style = ButtonStyle.Primary
                progress ++;
                resolve({progress , BtnData})
                break;
        
            case"Secondary"+interaction.user.id:
                await button.deferUpdate().catch(err => null)
                BtnData.style = ButtonStyle.Secondary
                progress ++;
                resolve({progress , BtnData})
                break;

                case"Success"+interaction.user.id:
                    await button.deferUpdate().catch(err => null)
                    BtnData.style = ButtonStyle.Success 
                    progress ++;
                    resolve({progress , BtnData})
                    break;

            case"Danger"+interaction.user.id:
                await button.deferUpdate().catch(err => null)
                BtnData.style = ButtonStyle.Danger
                progress ++;
                resolve({progress , BtnData})
                break;
        }
        
    })
})
}


async function getBtnData(interaction , menueMsg , ButtonDataModal , BtnData , buttonSetupProgressEmbed , progress) {
    const { client } = await import("../index.js");
    let Filter = (i : ButtonInteraction) => ["Showmodal"+interaction.user.id ].includes(i.customId) && i.user.id === interaction.user.id;
        
    let ShowDataModalBtnCollecoter = menueMsg.createMessageComponentCollector({time : 600000 , filter : Filter})
    return new Promise( async (resolve, reject) => { 
        try {
            ShowDataModalBtnCollecoter.on("collect" , async (button : ButtonInteraction) => {
                switch (button.customId) {
                    case "Showmodal"+interaction.user.id:
                        
                        let MSg = await button.showModal(ButtonDataModal).catch(err=> null)
                        let Modal = await button.awaitModalSubmit({time : 600000 , filter : i => i.customId === "ButtonDataModal"+interaction.user.id})
                        
                        if(Modal.fields.fields.filter(a => a.value).size <= 0)  Modal.reply({content : "عليك تقديم اي بينات لايمكن ترك القائمة فارغة", ephemeral : true}).catch(err => null);
        
                        else {
                            if(Modal.fields?.getField("btnLabel").value.length === 0 && Modal.fields?.getField("btnEmoji").value.length === 0) Modal.reply({content : "عليك تقديم اي بينات  (اسم الزر / سم الاموجي) علي الاقل", ephemeral : true}).catch(err => null);
                            else {
        
                            let EmbedDescription = buttonSetupProgressEmbed.data.description
        
                            BtnData.label = Modal.fields?.getField("btnLabel").value;
                            BtnData.Emoji = Modal.fields?.getField("btnEmoji").value;
                            if(BtnData.Emoji && BtnData.Emoji.length > 0 &&   (await containsSingleEmoji(BtnData.Emoji)).error) return Modal.reply({ephemeral : true , content : "تم ادخال اموجي خاطئ"});
                            else if(BtnData.Emoji && BtnData.Emoji.length > 0 && !(await containsSingleEmoji(BtnData.Emoji)).error) BtnData.Emoji = (await containsSingleEmoji(BtnData.Emoji)).emoji;
                            if(BtnData.type  === "link") BtnData.url = Modal.fields?.getField("btnLink").value;                         
                            else if (BtnData.type  === "msg") BtnData.messaage = Modal.fields?.getField("btnMessaage").value;                        
        
                                progress ++
                                EmbedDescription += "\n**"+progress+".**  : اسم الزر" + `(${BtnData?.label?BtnData.label:"فارغ"})`
                                progress ++
                                EmbedDescription += "\n**"+progress+".**  : الايموجي" + `(${client.emojis.cache?.find((a) => a.id === BtnData?.Emoji)?client.emojis.cache?.find((a) => a.id === BtnData?.Emoji):BtnData?.Emoji?BtnData?.Emoji:"فارغ"})`
                                
                                                        
                                if(BtnData.type  === "link" &&validURL(BtnData?.url)=== false) {progress--;progress--;return Modal.reply({content : "يرجي كتابة رابط صالح " , ephemeral : true }).catch(err => null);}
                                else  if(validURL(BtnData?.url) === true){ progress ++; EmbedDescription += "\n**"+progress+".**   : الرابط" + `(${BtnData?.url?BtnData.url:"فارغ"})`}
                                if (BtnData.type  === "msg" && isDiscohookUrl(BtnData.messaage) === false || BtnData.type  === "msg"  && (await getUrldata(BtnData.messaage)).Error === true) {progress--;progress--;return Modal.reply({content : "يرجي كتابة رابط صالح ", ephemeral : true}).catch(err => null);}
                                else if( (await getUrldata(BtnData.messaage)).Error === false) { progress ++;EmbedDescription += "\n**"+progress+".**   : بينات الرساله" + `(تم اخذها من الرابط)`;BtnData.messaage =(await getUrldata(BtnData.messaage)).data}
                                
                                
                                await Modal.deferUpdate().catch(err => null);
                                buttonSetupProgressEmbed.setDescription(EmbedDescription)
                                ShowDataModalBtnCollecoter.stop();
                                resolve({progress})
                            }
                        }
                        break;
                }
            })
        } catch (error) {
            null;
        }

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


function isDiscohookUrl(url:string) {
    const validURLPattern = /^(https:\/\/(share\.discohook\.app\/go\/|discohook\.org\/))/;
    return validURLPattern.test(url);
  }


async function getUrldata(url:string) {
    if(isDiscohookUrl(url) === false)  return {Error : true};
    let data = await fetch(url)
    let BufferData = Buffer.from(data.url.replace("https://discohook.org/?data=", ""), "base64")    
    return {Error : false , data : data.url.replace("https://discohook.org/?data=", "")}
}



async function containsSingleEmoji(message:string) {
    const { client } = await import("../index.js");

    // Define a regular expression pattern for matching emojis
    const emojiPattern = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji}\uFE0E/gu;

    // Use the match method to find all emojis in the message
    const emojis = message.match(emojiPattern);

    // Check if the message contains exactly one emoji
    if (emojis !== null && emojis.length === 1 && emojis[0] === message) {
        return { error: false, emoji: message };
    } else {
        // If it's not a single emoji, check if it's a custom emoji from Discord
        let disEmoji = client.emojis.cache?.find((a) => a.id === message || a.name === message);
        if (disEmoji) {
            return { error: false, emoji:disEmoji.id };
        } else {
            return { error: true, emoji: null };
        }
    }
}




