import {  APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType, APIActionRowComponent, APIActionRowComponentTypes, Message, MessagePayload, ComponentType, MessageActionRowComponent, ActionRow, MessageContextMenuCommandInteraction, ChannelType} from "discord.js";
import {Buffer} from'buffer';
import buttonInteraction from "../../events/client/buttonInteraction.js";
import { client } from "../../index.js";
import buttonConfig from "../../models/button.js";
import { MenuPages } from "../../utils/menue.js";


export default {
    name: "button_msg",
	description: "to add a button to the message",
	permissions: ["0"],
	roleRequired: "", // id here
	cooldown: 0, // in ms
    options : [
        {name : "button_id" , description : "اكتب ايدي الزر" , required: true,type: ApplicationCommandOptionType.Number  ,focused: true	,autocomplete : true	}
    ],
    function : async function({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply({fetchReply : true , ephemeral : true});
        let BtnID = interaction.options.getNumber("button_id");
        let orignalBtnData = await buttonConfig.findOne({guildId : interaction.guildId , btnID: BtnID});
        if(!orignalBtnData) return interaction.editReply({embeds : [new EmbedBuilder().setDescription("## لا يمكنني العثور علي بينات الزر").setColor("DarkRed")]})
        let Msg = JSON.parse(Buffer.from( orignalBtnData.data?.messaage , "base64").toString()) as { messages: [ { data: MessagePayload } ] } ;        
        let buttonMsg = await interaction.channel.send(Msg.messages[0].data)
        let MangeOptions = [{label : "اضافة زر" , value : "add" , Emoji : "➕"}]
        if (buttonMsg.components.length > 0) MangeOptions.push({label: "حذف زر" , value : "delete" , Emoji : "🗑️"}, {label: "تعديل علي زر" , value : "edit" , Emoji : "⚙️"})
        let MangeOptionsMenu = await MenuPages({pages : MangeOptions , MenuPlaceholder : "اختر الوظفية التي تريد القيام بها" , menueLimts : {MaxValues : 1 , MinValues : 1} , message : {editReply : true , message : interaction , interaction : interaction as any  } , save : false, cancel : false}) as any
        let MangeType = MangeOptionsMenu.values.flat().find(v => v.value).value
        
        let AdditionalComponents = []
        let BtnsID = []
        if(MangeType == "add") {
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
            let BtnData = {msgChannel : null,type : menueSub.values.value,label : null, Emoji : null,url : null, messaage : null,role : null,messageType : null ,style : null}
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
                    let messageType = [{label : "مخفية في الروم" , Description : "رساله مخفية يراها من يضغط علي الزر فقط" , Emoji : "👁️" ,value : "hide" } , {label : "عامة في الروم", Description : "رسالة تكون ظاهر للكل" , value : "public"  , Emoji : "📝"} , {label : "في روم مخصص", Description : "تنرسل رساله في روم محددة" , value : "room"  , Emoji : "📨"} , {label : "رساله في الخاص" , Description : "يتم ارسال رساله الي خاص العضو" , value : "dm" , Emoji : "✉️"}] as any[]
                    let MsgTypeMenue = await MenuPages({pages: messageType,MenuPlaceholder: "حدد نوع الرساله",message: {editReply: true,interaction: interaction as any,message: interaction,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                    BtnData.messageType = MsgTypeMenue.values.flat().find(a => a.value).value
                    Btnprogress.progress ++; 
                    let EmbedDescriptions = buttonSetupProgressEmbed.data.description
                    buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                    EmbedDescriptions += "\n**"+Btnprogress.progress+".**   :  نوع الرساله" + `(${messageType.find(a => a.value === BtnData.messageType) .label })`
                    if(MsgTypeMenue.values.flat().find(a => a.value).value == "room") {
                        let channels = (await interaction.guild.channels.fetch()).filter(e => e.type === ChannelType.GuildText).map(e => ({label : e.name , Description : e?.parent?.name?e.parent.name:"null" , value : e.id , Emoji : e.isVoiceBased()?"🔊":'📝' }))
                        let msgChannel = await MenuPages({pages: channels,MenuPlaceholder: "حدد روم الرساله",message: {editReply: true,interaction: interaction as any,message: interaction,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                        BtnData.msgChannel = msgChannel.values.flat().find(a => a.value).value
                        EmbedDescriptions += "\n**"+Btnprogress.progress+".**   :   ألروم" + `(<#${BtnData.msgChannel }>)`
                    }
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
                
                let {customID , BtnIndex} = await addBtn(buttonMsg , BtnData, Btnprogress.progress , buttonSetupProgressEmbed) as any
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                let EmbedDescription = buttonSetupProgressEmbed.data.description
                let BtnStyles = {1 : "بنفسجي" , 2 : "رمادي" , 3 : "اخضر" , 4 : "احمر",5 : "رمادي يتفاعل مع رابط"}
                EmbedDescription += "\n**"+Btnprogress.progress+".**  : شكل الزر " + `(${BtnStyles[BtnData.style?BtnData.style:5]})`
                buttonSetupProgressEmbed.setDescription(EmbedDescription)
                let saveButtonData = await buttonConfig.create({guildId : interaction.guildId , ID : customID , data : BtnData  , btnID : BtnIndex , type : BtnData?.type})
                buttonSetupProgressEmbed.addFields({name : "> ID : " , value : `${BtnIndex}` , inline : true } ,{name : "> custom ID : " , value : `${customID}` , inline: true})  
                menueMsg =  await interaction.editReply({embeds : [buttonSetupProgressEmbed  ] , components : [],content : "" }).catch(err => null)  
                let MsgData:any = {
                    "messages":
                    [
                        {"data":{
                            "content":(buttonMsg.content.length > 0) ? buttonMsg.content : null,
                            "embeds":(buttonMsg.embeds.length > 0) ? buttonMsg.embeds : null,
                            "attachments":[],
                            "components" : (buttonMsg.components.length > 0) ? buttonMsg.components : null
                        }}]}

                MsgData =  JSON.stringify(MsgData)

                let bufferMsg = Buffer.from(MsgData,"utf-8").toString("base64")
                await orignalBtnData.updateOne({data : {
                    type  :  orignalBtnData.data.type,
                    label : orignalBtnData.data.label,
                    Emoji : orignalBtnData.data.Emoji,
                    url   : orignalBtnData.data.url,
                    messaage : bufferMsg,
                    msgChannel : orignalBtnData?.data.msgChannel,
                    role  : orignalBtnData.data.role,
                    messageType : orignalBtnData.data.messageType,
                    style : orignalBtnData.data.style
                    }})
            }     else {
                await changeUrlBtn(buttonMsg.components as any, AdditionalComponents, BtnsID , interaction) 
                await interaction.editReply({components : AdditionalComponents , content :  MangeType === "delete" ? "اضغط علي الزر الذي تريد حذفة" : "اضغط علي الزر الذي تريد تعديله"})
                let filters = async (i:ButtonInteraction) => BtnsID.includes(i.customId) && i.user.id === interaction.user.id && i.message.id === (await interaction.fetchReply()).id;
                let collecter = (await interaction.fetchReply()).createMessageComponentCollector({time : 1800000 , filter : filters , componentType : ComponentType.Button})
                try {
                    collecter.on("collect" , async (button) => {                
                        await button.deferReply({ephemeral : true})
                        if (MangeType === "delete") {
                        let deletedBtn;
                        await deleteBtn(button,AdditionalComponents,buttonMsg.components  , BtnsID , deletedBtn)
                        await interaction.editReply({components : AdditionalComponents}).catch(err => null)
                        await buttonMsg.edit( {components : AdditionalComponents})
                        await buttonConfig.findOneAndRemove({guildId : button.guildId ,  ID : button.customId })
                        } else {
                            let editData = await editBtn(button ,buttonMsg.components , AdditionalComponents,BtnsID,buttonMsg )
                            await interaction.editReply({components : AdditionalComponents})
                            await  buttonMsg.edit( {components : buttonMsg.components })
                            let update = await buttonConfig.findOneAndUpdate({guildId : button.guildId ,  ID : button.customId } ,{ guildId : button.guildId ,  ID : editData.ID ,btnID : editData.btnID , data : editData.data,type : editData.type  } )
                            console.log(update);
                            
                        }

                        let MsgData:any = {
                            "messages":
                            [
                                {"data":{
                                    "content":(buttonMsg.content.length > 0) ? buttonMsg.content : null,
                                    "embeds":(buttonMsg.embeds.length > 0) ? buttonMsg.embeds : null,
                                    "attachments":[],
                                    "components" : (buttonMsg.components.length > 0) ? buttonMsg.components : null
                                }}]}
        
                        MsgData =  JSON.stringify(MsgData)
        
                        let bufferMsg = Buffer.from(MsgData,"utf-8").toString("base64")
                        await orignalBtnData.updateOne({data : {
                            type  :  orignalBtnData.data.type,
                            label : orignalBtnData.data.label,
                            Emoji : orignalBtnData.data.Emoji,
                            url   : orignalBtnData.data.url,
                            messaage : bufferMsg,
                            msgChannel : orignalBtnData?.data.msgChannel,
                            role  : orignalBtnData.data.role,
                            messageType : orignalBtnData.data.messageType,
                            style : orignalBtnData.data.style
                            }})
                    collecter.stop()
                    await button.deleteReply().catch(error => null);
                    await interaction.deleteReply().catch(error => null);
                    })
                } catch (error) {
                    null;
                }

        }

        
        
        
    }
    ,
    autocomplete: async function({ interaction } : {interaction : AutocompleteInteraction}) {
        if (!interaction.inCachedGuild()) return;
        const focusedOption = interaction.options.getFocused(true);
        const focusedValue = interaction.options.getFocused()  as any;

		switch (focusedOption.name) {
			case "button_id":
				let Btndata = await buttonConfig.find({guildId : interaction.guildId, type : "msg" })
                let data = [];
                
                if (focusedValue) Btndata.filter(e => (e.btnID==focusedValue) ? data.push({name : `#${e.data.label} | ${e.ID} (${e.btnID})`, value : e.btnID}) : false)
				else if (Btndata.length == 0) data.push({name : "No Msg Button" , value : 0})
                else  Btndata.map(e => data.push({name : `#${e.data.label} | ${e.ID} (${e.btnID})`, value : e.btnID}))
                
                interaction.respond(data)
				break;
		}

    
    }, 
}
async function deleteBtn(button:ButtonInteraction , AdditionalComponents:ActionRow<MessageActionRowComponent>[] , MessageRows:ActionRow<MessageActionRowComponent>[] , BtnsID:any[] , deletedBtn) {
    let messaageID= (await button.fetchReply());
    let confirmbtn = new ButtonBuilder()
    .setCustomId("confirmbtn"+messaageID.id)
    .setEmoji("✔️")
    .setStyle(ButtonStyle.Success) 
    let cancelbtn = new ButtonBuilder()
    .setCustomId("cancelbtn"+messaageID.id)
    .setEmoji("✖️")
    .setStyle(ButtonStyle.Danger) 
    let confirmationAction = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmbtn,cancelbtn)
    let confirmationMsg = await button.editReply({content : "هل انت متاكد من حذف الزر ؟"  , components : [confirmationAction] })
    let confirmation = await confirmationMsg.awaitMessageComponent({time : 600000 , componentType : ComponentType.Button , filter : i=> ["cancelbtn"+messaageID.id , "confirmbtn"+messaageID.id].includes(i.customId) && i.user.id === button.user.id })                    
    await confirmation.deferUpdate()
    if(confirmation.customId === "confirmbtn"+messaageID) {
        await button.deleteReply()
        let btnIndex: number,ActtionIndex: number;
        AdditionalComponents.map((component , Aindex) => component.components.findIndex((btn:any , bindex)=> {if (btn.data.custom_id === button.customId) {btnIndex = bindex; ActtionIndex = Aindex}}));        
        deletedBtn = (MessageRows[ActtionIndex].components[btnIndex]).data;
        (MessageRows[ActtionIndex].components.length == 1) ? MessageRows.splice(ActtionIndex,1) ? AdditionalComponents.splice(ActtionIndex,1) : false : MessageRows[ActtionIndex]?.components.splice(btnIndex , 1) ?  AdditionalComponents[ActtionIndex]?.components.splice(btnIndex , 1) ? BtnsID.splice( BtnsID.findIndex(a=>a === button.customId) , 1) : false: false;
    } else {
        await button.deleteReply()
    }
}

async function editBtn(button:ButtonInteraction ,MessageRows:ActionRow<MessageActionRowComponent>[] , AdditionalComponents:ActionRow<MessageActionRowComponent>[] , BtnsID:any[] , WebhoockMsg:Message) {
    let BtnFunsArray  =[{label : "رابط" ,Description:"لتحديد رابط موقع او رساله" , value :"link" , Emoji:"🌐"},{label : "رتبة" ,Description:"اضافة او حذف رتبة للعضو" , value :"role" , Emoji:"🛡️"},{label : "رساله مخصصة" ,Description:"لاظهار / ارسال رساله في الروم او في الخاص" , value :"msg" , Emoji:"📝"},{label : "ولا شئ" ,Description:"زر للشكل فقط بدون اي وظيفة" , value :"null" , Emoji:"❓"}]
        
    let menueSub = await MenuPages({ pages: BtnFunsArray, MenuPlaceholder: "اختر وظيفة الزر", message: {  editReply: true, content: "برجاء اختيار وظيفة الزر الذي سيتم اضافتة" ,message : button, interaction : button as any , embeds : []}, menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false})  as any;
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
        .setCustomId("Showmodal"+button.user.id)
        .setLabel("اظهار القائمة")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
        let ButtonDataModal = new ModalBuilder()
        .setCustomId("ButtonDataModal"+button.user.id)
        .setTitle("بينات الزر")
        .addComponents( new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLabel").setLabel("اسم الزر").setPlaceholder("اكتب الكلام الذي تريد اظهاره علي الزر").setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(80)),new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnEmoji").setLabel("اسم الاموجي او الايدي").setPlaceholder("يجب ان يكون الاموجي الخاص موجود بنفس سيرفرات البوت او اموجي عام").setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(80)) )

        let ActionRows = new ActionRowBuilder<ButtonBuilder>().addComponents(ShowDataModalBtn)
        let BtnData = {msgChannel : null,type : menueSub.values.value,label : null, Emoji : null,url : null, messaage : null,role : null,messageType : null ,style : null}
        switch (menueSub.values.value) {
            case "link":
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                explainEmbed.setDescription("**اكتب اسم الزر , الايموجي و الرابط  في القائمة المنبثقة  **")
                ButtonDataModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLink").setLabel("الرابط").setPlaceholder("اكتب الرابط الذي تريد ربطه بالزر").setStyle(TextInputStyle.Paragraph).setRequired(true)))
                break;
            
            case "role" :
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                explainEmbed.setDescription("**حدد الرتبة التي تريد تطبيقها علي هذا الزر من القائمه في الاسفل**")  
                let rolesMenue = await MenuPages({pages: (await button.guild.roles.fetch()).map(a => ({ label: a.name, value: a.id  })),MenuPlaceholder: "اختر الرتبة التي تريد اعطائها عن الضغط علي الزر",message: {editReply : true,interaction: button as any,message: button,content : "" ,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                if(rolesMenue.timeOut) return
                BtnData.role = rolesMenue.values.flat().find(a => a.value).value
                let selectedRole = await button.guild.roles.fetch(BtnData.role, {force : true})
                while (selectedRole.position >= button.guild.members.me.roles.highest.position) {
                    rolesMenue.interaction.followUp({ephemeral : true, content : `لا يمكنني اعطاء الاعضاء رتبة${selectedRole} اعلي مني او نفس رتبتي , يرجي اختيار رتبة اخري`}).catch(err => null)
                    rolesMenue = await MenuPages({pages: (await button.guild.roles.fetch()).map(a => ({ label: a.name, value: a.id  })),MenuPlaceholder: "اختر الرتبة التي تريد اعطائها عن الضغط علي الزر",message: {editReply : true,interaction: button as any,message: button,content : "" ,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                    if(rolesMenue.timeOut) return
                    BtnData.role = rolesMenue.values.flat().find(a => a.value).value
                    selectedRole = await button.guild.roles.fetch(BtnData.role)
                    if(selectedRole.position < button.guild.members.me.roles.highest.position) break;
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
                let messageType = [{label : "مخفية في الروم" , Description : "رساله مخفية يراها من يضغط علي الزر فقط" , Emoji : "👁️" ,value : "hide" } , {label : "عامة في الروم", Description : "رسالة تكون ظاهر للكل" , value : "public"  , Emoji : "📝"} , {label : "في روم مخصص", Description : "تنرسل رساله في روم محددة" , value : "room"  , Emoji : "📨"} , {label : "رساله في الخاص" , Description : "يتم ارسال رساله الي خاص العضو" , value : "dm" , Emoji : "✉️"}] as any[]
                let MsgTypeMenue = await MenuPages({pages: messageType,MenuPlaceholder: "حدد نوع الرساله",message: {editReply: true,interaction: button as any,message: button,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                BtnData.messageType = MsgTypeMenue.values.flat().find(a => a.value).value
                Btnprogress.progress ++; 
                let EmbedDescriptions = buttonSetupProgressEmbed.data.description
                buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                EmbedDescriptions += "\n**"+Btnprogress.progress+".**   :  نوع الرساله" + `(${messageType.find(a => a.value === BtnData.messageType) .label })`
                if(MsgTypeMenue.values.flat().find(a => a.value).value == "room") {
                    let channels = (await button.guild.channels.fetch()).filter(e => e.type === ChannelType.GuildText).map(e => ({label : e.name , Description : e?.parent?.name?e.parent.name:"null" , value : e.id , Emoji : e.isVoiceBased()?"🔊":'📝' }))
                    let msgChannel = await MenuPages({pages: channels,MenuPlaceholder: "حدد روم الرساله",message: {editReply: true,interaction: button as any,message: button,embeds : [buttonSetupProgressEmbed , explainEmbed]},menueLimts: {MinValues: 1,MaxValues: 1},save: false,cancel: false}) as any
                    BtnData.msgChannel = msgChannel.values.flat().find(a => a.value).value
                    EmbedDescriptions += "\n**"+Btnprogress.progress+".**   :   ألروم" + `(<#${BtnData.msgChannel }>)`
                }
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
        await button.editReply({embeds : [buttonSetupProgressEmbed , explainEmbed ] , components : [ActionRows] , content : ""}).catch(err => null)
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`) 
        let getdata = await getBtnData(button , menueMsg , ButtonDataModal , BtnData , buttonSetupProgressEmbed , Btnprogress.progress) as any
        Btnprogress.progress = getdata.progress
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
        explainEmbed.setDescription("**اضغط علي شكل الزر الذي تريد اضافته**")

        let Btn1 = new ButtonBuilder()
        .setCustomId("Primary"+button.user.id)
        .setStyle(ButtonStyle.Primary)
        let Btn2 = new ButtonBuilder()
        .setCustomId("Secondary"+button.user.id)
        .setStyle(ButtonStyle.Secondary)
        let Btn3 = new ButtonBuilder()
        .setCustomId("Success"+button.user.id)
        .setStyle(ButtonStyle.Success)
        let Btn4 = new ButtonBuilder()
        .setCustomId("Danger"+button.user.id)
        .setStyle(ButtonStyle.Danger)
        
        if(BtnData.label && BtnData.label.length >= 1){ Btn1.setLabel(BtnData.label);Btn2.setLabel(BtnData.label);Btn3.setLabel(BtnData.label);Btn4.setLabel(BtnData.label);}
        if(BtnData.Emoji && BtnData.Emoji.length >= 1) {Btn1.setEmoji(BtnData.Emoji);Btn2.setEmoji(BtnData.Emoji);Btn3.setEmoji(BtnData.Emoji);Btn4.setEmoji(BtnData.Emoji);}
        
        ActionRows.setComponents(Btn1, Btn2, Btn3,Btn4)

        await button.editReply({embeds : [buttonSetupProgressEmbed , explainEmbed ] , content : ""}).catch(err => null)
        if(BtnData.type !== "link") { 
            await button.editReply({ components : [ActionRows] , content : ""}).catch(err => null)
            let choseBtns = await choseBtn(button , menueMsg , BtnData , Btnprogress.progress) as any
            Btnprogress.progress =  choseBtns.progress
             BtnData = choseBtns.BtnData
        } else   await button.editReply({embeds : [buttonSetupProgressEmbed  ] ,components : [] , content : ""}).catch(err => null) ;
        buttonSetupProgressEmbed.setTitle(`## تجهيز الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
        let EmbedDescription = buttonSetupProgressEmbed.data.description
        let BtnStyles = {1 : "بنفسجي" , 2 : "رمادي" , 3 : "اخضر" , 4 : "احمر",5 : "رمادي يتفاعل مع رابط"}
        EmbedDescription += "\n**"+Btnprogress.progress+".**  : شكل الزر " + `(${BtnStyles[BtnData.style?BtnData.style:5]})`
        buttonSetupProgressEmbed.setDescription(EmbedDescription)

        let btnIndex: number,ActtionIndex: number;
        AdditionalComponents.map((component , Aindex) => component.components.findIndex((btn:any , bindex)=> {if (btn.data.custom_id === button.customId) {btnIndex = bindex; ActtionIndex = Aindex}}));        
        BtnData.style = BtnData.style ? BtnData.style : 5;
        let newBtn = new ButtonBuilder().setStyle(BtnData.style);
        // MessageRows[ActtionIndex].components[btnIndex] = 
        if(BtnData?.Emoji) newBtn.setEmoji(BtnData?.Emoji);
        if(BtnData?.label) newBtn.setLabel(BtnData?.label);
        if(BtnData?.url) newBtn.setURL(BtnData?.url);
        let BtnDataBase = await buttonConfig.findOne({guildId : button.guildId , ID : button.customId })
        let BtnsIndex = await buttonConfig.find({guildId : button.guildId})
        BtnsIndex = (BtnDataBase.btnID ? BtnDataBase.btnID : (BtnsIndex.length + 1)) as any;
        let customID:string;
        if(BtnData.type === "link") {customID = "UrlBtn"+BtnsIndex}
        else if(BtnData.type === "msg") { newBtn.setCustomId("customBtnMsg"+BtnsIndex); customID = "customBtnMsg"+BtnsIndex}
        else if(BtnData.type === "null") {newBtn.setCustomId("customBtnNull"+BtnsIndex); customID = "customBtnNull"+BtnsIndex}
        else if(BtnData.type === "role") {newBtn.setCustomId("customBtnRole"+BtnsIndex); customID = "customBtnRole"+BtnsIndex;}
        MessageRows[ActtionIndex].components[btnIndex] = newBtn as any;
        menueMsg =  await button.editReply({embeds : [buttonSetupProgressEmbed  ] , content : ""}).catch(err => null)  
        return {
            guildId: button.guildId,
              ID : customID,
              btnID : BtnsIndex,
              data : BtnData,
              type : BtnData.type,
        }
}

async function changeUrlBtn(MessageRows:ActionRowBuilder<ButtonBuilder>[] , AdditionalComponents:any[] , BtnsID:any[] , interaction:ChatInputCommandInteraction) {
    let btncount = 0
    let buttons = []
    let UrlBtnData:(any[] | any);
    for (let row of MessageRows  ) {
        for (let btn of row.components) {
            btncount ++
            if (btn.data.style === ButtonStyle.Link) {
                UrlBtnData = await buttonConfig.find({guildId : interaction.guildId,type : "link"});
                UrlBtnData = UrlBtnData.filter(a => a.ID.startsWith("UrlBtn"))?.find(a => a.data.type == "link"&& a.data.url==btn?.data["url"] && a.data.label === (btn.data?.label ?  btn.data?.label : "") && a.data.Emoji === (btn.data?.emoji?.id ? btn.data?.emoji?.id : btn.data?.emoji?.name ?  btn.data?.emoji?.name : "")) 
                let newUrlbtn = new ButtonBuilder().setCustomId(UrlBtnData.ID).setStyle(2)
                if(btn.data?.label && btn.data.style === ButtonStyle.Link) newUrlbtn.setLabel(btn.data?.label);
                if(btn.data?.emoji && btn.data.style === ButtonStyle.Link) newUrlbtn.setEmoji(btn.data?.emoji);    
               BtnsID.push(UrlBtnData.ID)
               buttons.push(newUrlbtn) 
            } else {
                buttons.push(new ButtonBuilder(btn.data)) 
                BtnsID.push(btn.data.custom_id) 
            }
        }
        
        AdditionalComponents.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons))
        buttons = []
    }

    return AdditionalComponents

}
async function addBtn( WebhoockMsg : Message , BtnData , progress , buttonSetupProgressEmbed  ) {
    let ActionRows = WebhoockMsg.components
    let BtnAdded = false
    let components = []
    let BtnIndex = (await buttonConfig.find({guildId : WebhoockMsg.guildId})).length
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

   await WebhoockMsg.edit( {components : components}).catch(err => null)
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
    const { client } = await import("../../index.js");
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
    const { client } = await import("../../index.js");

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
