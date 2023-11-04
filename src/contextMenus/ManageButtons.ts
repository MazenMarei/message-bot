import {ApplicationCommandType,ComponentEmojiResolvable,MessageContextMenuCommandInteraction, APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType, APIActionRowComponent, APIActionRowComponentTypes, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, Message, ModalSubmitInteraction, ChannelSelectMenuBuilder, ActionRow} from "discord.js";
import { MenuPages } from "../utils/menue.js";
import buttonConfig from "../models/button.js";

export default {
    name: "Manage  Button",
    id : "Manage Button",
    type: ApplicationCommandType.Message,
    function: async function ({ interaction }: { interaction: MessageContextMenuCommandInteraction }) {
        const { client } = await import("../index.js");
        await interaction.deferReply({ephemeral : true});
        let WebhoockMsg = interaction?.targetMessage 
        let getWebhook = (await interaction.guild.fetchWebhooks()).filter(a => a.id === WebhoockMsg.webhookId && a.owner.id === interaction.guild.members.me.id);
        let webhookCommandId = (await interaction.guild.commands.fetch({force : true})).filter(a => a.applicationId === interaction.guild.members.me.id && a.name === "webhook").first();
        if(!getWebhook || getWebhook.size <= 0 ) return interaction.editReply({embeds : [new EmbedBuilder().setColor("Red").setDescription(`## **لا يمكني اضافة زر الي هذه الرساله , يجب علي الرساله ان تكون من صنع __ويب هوك__ وان يكون الويب هوك من __صنع البوت__ (يمكنك صنع ويب هوك من صنع البوت عن طريق استخادم </webhook create:${webhookCommandId.id}>)**`)]}).catch(err => null)
        let MangeOptions = [{label: "حذف زر" , value : "delete" , Emoji : "🗑️"}, {label: "تعديل علي زر" , value : "edit" , Emoji : "⚙️"}]
        let MangeOptionsMenu = await MenuPages({pages : MangeOptions , MenuPlaceholder : "اختر الوظفية التي تريد القيام بها" , menueLimts : {MaxValues : 1 , MinValues : 1} , message : {editReply : true , message : interaction , interaction : interaction as any  } , save : false, cancel : false}) as any
        let MangeType = MangeOptionsMenu.values.flat().find(v => v.value).value
        let components3 = []
        let BtnIndex = 0
        let urlBtn:{Id:string , url:string, label: string , emoji : object}[] = []
        let btnsIds = [];WebhoockMsg.components.map(component => component.components.map(button => btnsIds.push(button.customId)))
        WebhoockMsg.components.map((component , i) => { 
            let buttons = [];
            if(component.components.find((a:any) => a.data.style ===5)) {
                component.components.map((btn:any) => {
                    BtnIndex++
                    if(btn.data.style ===5 ) {
                        let btn2 = new ButtonBuilder()
                        .setCustomId(`customBtnLink${BtnIndex}`)
                        .setStyle(ButtonStyle.Secondary);if(btn.data.label) 
                        btn2.setLabel(btn.data.label);if(btn.data.emoji) 
                        btn2.setEmoji(btn.data.emoji); buttons.push(btn2);
                        btnsIds.push(`customBtnLink${BtnIndex}`)
                        urlBtn.push({Id : `customBtnLink${BtnIndex}` , url : btn.data.url , label : btn.data.label , emoji : btn.data.emoji})
                    } else buttons.push(btn);});
                    if(buttons.length > 0) components3.push(new ActionRowBuilder<ButtonBuilder>().setComponents(buttons)) } else components3.push(component)})
        await interaction.editReply({content : `اضغط علي الزر المراد ${MangeType === "edit"?"تعديلة": "حذفة"}` , components : components3});
        let Btncollector = (await interaction.fetchReply()).createMessageComponentCollector({time : 600000 , filter : async i=> btnsIds.includes(i.customId) && i.user.id === interaction.user.id && i.message.id === (await interaction.fetchReply()).id})
        Btncollector.on("collect" , async button => {
            switch (MangeType) {
                case "delete":
                    let confirmbtn = new ButtonBuilder()
                    .setCustomId("confirmbtn"+button.message.id)
                    .setEmoji("✔️")
                    .setStyle(ButtonStyle.Success) 
                    let cancelbtn = new ButtonBuilder()
                    .setCustomId("cancelbtn"+button.message.id)
                    .setEmoji("✖️")
                    .setStyle(ButtonStyle.Danger) 

                    let confirmationAction = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmbtn,cancelbtn)
                    let confirmationMsg = await button.reply({content : "هل انت متاكد من حذف الزر ؟"  , components : [confirmationAction] , ephemeral : true})

                    let confirmation = await (await button.fetchReply()).awaitMessageComponent({time : 600000 , componentType : ComponentType.Button , filter : i=> ["cancelbtn"+button.message.id , "confirmbtn"+button.message.id].includes(i.customId) && i.user.id === button.user.id })                    
                    await confirmation.deferUpdate()
                    switch (confirmation.customId) {                        
                        case "confirmbtn"+button.message.id:
                            let components = []
                            WebhoockMsg.components.map((component , i) => {
                                let buttons = [];if(component.components.find((a:any) => a.customId === button.customId || a.data?.url && urlBtn.find(b => b.Id === button.customId && b.url === a.data?.url)) ) {
                                component.components.map((btn:any) => {
                                if(btn.data?.url && urlBtn.find(a => a.Id === button.customId && a.url === btn.data?.url)) return  
                                if(btn.customId !== button.customId ) buttons.push(btn);
                                }
                            );
                                if(buttons.length > 0) components.push(new ActionRowBuilder<ButtonBuilder>().setComponents(buttons))
                            }else components.push(component)})
                            await getWebhook.first().editMessage(WebhoockMsg , {components : components})
                            await interaction.editReply({components : components3})
                            await confirmationMsg.delete().catch(() => null)
                            let BtnData = await buttonConfig.findOne({ID : button.customId , guildId: button.guildId, message : WebhoockMsg.id})
                            if(BtnData) (await BtnData.deleteOne()).save().catch(() => null)
                            break;
                    
                        case "cancelbtn"+button.message.id:
                            await  confirmationMsg.delete().catch(() => null)
                            break;
                    }
                    break;
            
                case "edit":
                    let Btnprogress = {
                        progress : 1,
                        "link" : 4,
                        "role" : 5,
                        "msg" : 6,
                        "null" : 4
                    }
                    let BtnData = {
                        type : null,
                        label : null,
                        Emoji : null,
                        url : null,
                        messaage : null,
                        role : null,
                        messageType : null ,
                        style : null,
                        Id : null
                    }
                    if(button.customId.startsWith("customBtnRole")) BtnData.type = "role"
                    else if(button.customId.startsWith("customBtnMsg")) BtnData.type = "msg"
                    else if(button.customId.startsWith("customBtnNull")) BtnData.type = "null"
                    else BtnData.type = "link"

                    let buttonSetupProgressEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    buttonSetupProgressEmbed.setTitle(`## تعديل الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                    
                    let EditBtn = new ButtonBuilder()
                    .setCustomId("EditBtn"+button.message.id)
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Success)

                    let editBtnMsg = await button.reply({ephemeral : true , embeds : [buttonSetupProgressEmbed] , components : [new ActionRowBuilder<ButtonBuilder>().addComponents(EditBtn)]})
                    WebhoockMsg.components.find(component => {
                        if(component.components.find((a:any) => a.customId === button.customId|| a.data?.url && urlBtn.find(b => b.Id === button.customId && b.url === a.data?.url))) {
                            
                            let Btn =  component.components.find((a:any) => a.customId === button.customId || a.data?.url && urlBtn.find(b => b.Id === button.customId && b.url === a.data?.url)).data as any;
                            BtnData.label = Btn.label;BtnData.Emoji = Btn.emoji;BtnData.style = Btn.style;BtnData.url = Btn.url;BtnData.Id = button.customId;
                        }})
                    let btnLabel =  new TextInputBuilder()
                    .setCustomId("btnLabel").setLabel("اسم الزر")
                    .setPlaceholder("اكتب الكلام الذي تريد اظهاره علي الزر")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false).setMaxLength(80)
                    let btnEmoji= new TextInputBuilder()
                    .setCustomId("btnEmoji")
                    .setLabel("اسم الاموجي او الايدي")
                    .setPlaceholder("يجب ان يكون الاموجي الخاص موجود بنفس سيرفرات البوت او اموجي عام")
                    .setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(80)
                    if(BtnData.label) btnLabel.setValue(BtnData.label)
                    if(BtnData.Emoji) btnEmoji.setValue(BtnData.Emoji.id?BtnData.Emoji.id:BtnData.Emoji.name)
                    let EditModal = new ModalBuilder()
                    .setCustomId("ButtonDataModal"+interaction.user.id)
                    .setTitle("بينات الزر")
                    .addComponents( 
                        new ActionRowBuilder<TextInputBuilder>().addComponents(btnLabel),
                        new ActionRowBuilder<TextInputBuilder>().addComponents(btnEmoji) )
                        if(BtnData.type === "link") EditModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnLink").setLabel("الرابط").setPlaceholder("اكتب الرابط الذي تريد ربطه بالزر").setStyle(TextInputStyle.Paragraph).setRequired(true).setValue(BtnData.url)))
                        if(BtnData.type === "msg") EditModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("btnMessaage").setLabel("رابط الرساله").setPlaceholder("اكتب رابط الرساله من موقع https://discohook.org/?data او https://share.discohook.app/go/").setStyle(TextInputStyle.Paragraph).setRequired(true)))
                        let EditCollecotr = (await button.fetchReply()).createMessageComponentCollector({time : 0 , filter : i => i.customId === "EditBtn"+button.message.id && i.user.id === button.user.id})
                        let newBtnData = await EditBtnData(EditCollecotr , button , EditModal , BtnData , buttonSetupProgressEmbed , interaction , Btnprogress , client) as any;
                        BtnData = newBtnData.BtnData
                        Btnprogress = newBtnData.Btnprogress
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
                        let ActionRows = new ActionRowBuilder<ButtonBuilder>().addComponents(Btn1,Btn2,Btn3,Btn4)
                        ActionRows.setComponents(Btn1, Btn2, Btn3,Btn4)

                        await interaction.editReply({components : [ActionRows]})
                        if(BtnData.type !== "link") {  
                            newBtnData=   await choseBtn(interaction ,(await interaction.fetchReply()), BtnData , Btnprogress.progress)
                            BtnData = newBtnData.BtnData
                             Btnprogress = newBtnData.Btnprogress
                        }else   await interaction.editReply({embeds : [buttonSetupProgressEmbed  ] ,components : [] , content : ""}).catch(err => null) ;
                        console.log(BtnData);
                        let newComponents = []
                        WebhoockMsg.components.map((component) => {
                            let buttons = []
                            if(component.components.find((a:any) => a.customId === button.customId|| a.data?.url && urlBtn.find(b => b.Id === button.customId && b.url === a.data?.url))) {
                                component.components.map((newbutton : any) => {
                                    if(newbutton.customId ===  button.customId ||  newbutton.data?.url && urlBtn.find(b => b.Id === button.customId && b.url === newbutton.data?.url)) {
                                        let newBtn = new ButtonBuilder()
                                        if(BtnData?.label&&BtnData?.label.length > 0) newBtn.setLabel(BtnData?.label)
                                        if(BtnData?.Emoji&&BtnData?.Emoji.name > 0) newBtn.setLabel(BtnData?.Emoji.id?BtnData?.Emoji.id:BtnData?.Emoji.name)
                                        if(BtnData.type === "link") newBtn.setURL(BtnData.url).setStyle(ButtonStyle.Link)
                                        else newBtn.setStyle(BtnData.style)
                                        buttons.push(newBtn)
                                    } else buttons.push(newbutton)
                                })
                               if(buttons.length > 0)  newComponents.push(buttons)
                            }
                        } )

                        await getWebhook.first().editMessage(WebhoockMsg, {components : newComponents})
                    break;
            }
        })

        Btncollector.on("end" ,async ()=> {await interaction.editReply({embeds : [] , components : [] , content : "تم انتهاء مهلة الانتظار"}).catch(err => null)} )
    },
} as any;



async function choseBtn(interaction , menueMsg , BtnData , progress) {
    let Filter = (i : ButtonInteraction) => ["Primary"+interaction.user.id,"Secondary"+interaction.user.id,"Success"+interaction.user.id,"Danger"+interaction.user.id ].includes(i.customId) && i.user.id === interaction.user.id;
        
    let ShowDataModalBtnCollecoter = await menueMsg.createMessageComponentCollector({time : 600000 , filter : Filter})
    return new Promise( async (resolve, reject) => { 
    ShowDataModalBtnCollecoter.on("collect" , async (button : ButtonInteraction) => {
        switch (button.customId) {
            case "Primary"+interaction.user.id:
                await button.deferUpdate().catch(err => null)
                BtnData.style = ButtonStyle.Primary
                progress ++;
                console.log("cliecked");

                resolve({progress , BtnData})
                break;
        
            case"Secondary"+interaction.user.id:
                await button.deferUpdate().catch(err => null)
                BtnData.style = ButtonStyle.Secondary
                progress ++;
                console.log("cliecked");

                resolve({progress , BtnData})
                break;

                case"Success"+interaction.user.id:
                    await button.deferUpdate().catch(err => null)
                    BtnData.style = ButtonStyle.Success 
                    progress ++;
                    console.log("cliecked");

                    resolve({progress , BtnData})
                    break;

            case"Danger"+interaction.user.id:
                await button.deferUpdate().catch(err => null)
                BtnData.style = ButtonStyle.Danger
                progress ++;
                console.log("cliecked");
                
                resolve({progress , BtnData})
                break;
        }
        
    })
})
}

async function EditBtnData(EditCollecotr , button , EditModal , BtnData , buttonSetupProgressEmbed , interaction , Btnprogress , client) {
    return new Promise( async (resolve, reject) => { 

    EditCollecotr.on("collect" , async (editbtn) => {
        if(editbtn.customId === "EditBtn"+button.message.id) {
            await editbtn.showModal(EditModal)
            let ModalSub = await editbtn.awaitModalSubmit({time : 600000 , filter : i => i.customId ==="ButtonDataModal"+interaction.user.id && i.user.id === editbtn.user.id})
            if(ModalSub.fields.fields.filter(a => a.value).size <= 0)  ModalSub.reply({content : "عليك تقديم اي بينات لايمكن ترك القائمة فارغة", ephemeral : true}).catch(err => null);

            else {
                if(ModalSub.fields?.getField("btnLabel").value.length === 0 && ModalSub.fields?.getField("btnEmoji").value.length === 0) ModalSub.reply({content : "عليك تقديم اي بينات  (اسم الزر / سم الاموجي) علي الاقل", ephemeral : true}).catch(err => null);
                else {                
                BtnData.label = ModalSub.fields?.getField("btnLabel").value;
                BtnData.Emoji = ModalSub.fields?.getField("btnEmoji").value;
                if(BtnData.Emoji && BtnData.Emoji.length > 0 &&   (await containsSingleEmoji(BtnData.Emoji)).error) return ModalSub.reply({ephemeral : true , content : "تم ادخال اموجي خاطئ"});
                else if(BtnData.Emoji && BtnData.Emoji.length > 0 && !(await containsSingleEmoji(BtnData.Emoji)).error) BtnData.Emoji = (await containsSingleEmoji(BtnData.Emoji)).emoji;
                if(BtnData.type  === "link") BtnData.url = ModalSub.fields?.getField("btnLink").value;                         
                else if (BtnData.type  === "msg") BtnData.messaage = ModalSub.fields?.getField("btnMessaage").value;                        
                let EmbedDescription = buttonSetupProgressEmbed.data.description

                    EmbedDescription += "\n**"+Btnprogress.progress +".**  : اسم الزر" + `(${BtnData?.label?BtnData.label:"فارغ"})`
                    Btnprogress.progress ++
                    EmbedDescription += "\n**"+Btnprogress.progress+".**  : الايموجي" + `(${client.emojis.cache?.find((a) => a.id === BtnData?.Emoji)?client.emojis.cache?.find((a) => a.id === BtnData?.Emoji):BtnData?.Emoji?BtnData?.Emoji:"فارغ"})`
                    
                                            
                    if(BtnData.type  === "link" &&validURL(BtnData?.url)=== false) {Btnprogress.progress --; Btnprogress.progress--;return ModalSub.reply({content : "يرجي كتابة رابط صالح " , ephemeral : true }).catch(err => null);}
                    else if(validURL(BtnData?.url) === true){ Btnprogress.progress ++; EmbedDescription += "\n**"+Btnprogress.progress+".**   : الرابط" + `(${BtnData?.url?BtnData.url:"فارغ"})`}
                    if (BtnData.type  === "msg" && isDiscohookUrl(BtnData.messaage) === false || BtnData.type  === "msg"  && (await getUrldata(BtnData.messaage)).Error === true) {Btnprogress.progress--; Btnprogress.progress--;return ModalSub.reply({content : "يرجي كتابة رابط صالح ", ephemeral : true}).catch(err => null);}
                    else if( (await getUrldata(BtnData.messaage)).Error === false) {BtnData.messaage =(await getUrldata(BtnData.messaage)).data}
                    
                    
                    await ModalSub.deferUpdate().catch(err => null);
                    buttonSetupProgressEmbed.setDescription(EmbedDescription)
                    buttonSetupProgressEmbed.setTitle(`## تعديل الزر (${Btnprogress.progress}/${Btnprogress[BtnData.type]})`)
                    button.editReply({embeds : [buttonSetupProgressEmbed] , components: []})
                    EditCollecotr.stop()
                    resolve ({BtnData : BtnData,Btnprogress : Btnprogress })
                }
            }
           
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


// function containsSingleEmoji(message:string) {
//     // Define a regular expression pattern for matching emojis
//     const emojiPattern = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji}\uFE0E/gu;

//     // Use the match method to find all emojis in the message
//     const emojis = message.match(emojiPattern);

//     // Check if the message contains exactly one emoji
//     if((emojis !== null && emojis.length === 1 && emojis[0] === message) === false )  {
//         let disEmoji = client.emojis.cache?.find(a => a.id === message || a.name === message);
//         if(disEmoji) return {error : false , emoji : disEmoji}
//         else  return {error : true , emoji : disEmoji}
//     } else return {error : emojis !== null && emojis.length === 1 && emojis[0] === message , emoji :message }
// }
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