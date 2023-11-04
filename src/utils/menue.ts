

/**
 * pages data {label : undefined , label : undefined, Description: undefined , Emoji: undefined} 
 * MenuPlaceholder 
 * values = {MinValues : 1 , MaxValues : 25 } 
 * if want a save btn save
 * respose type
 */
import { ActionRowBuilder,MessageFlagsBitField, AnySelectMenuInteraction,GuildTextBasedChannel, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentEmojiResolvable, ContextMenuCommandInteraction, EmbedBuilder, Interaction, InteractionReplyOptions, Message, StringSelectMenuBuilder, InteractionResponse, StringSelectMenuInteraction } from "discord.js"
import selectMenuInteraction from "../events/client/selectMenuInteraction.js"

interface value { 
  label: string;
  value: string;
  Description: string;
  Emoji: ComponentEmojiResolvable ,
  default ? : boolean 
}

interface functionRrturn {
  MaxValues : boolean,
  saved : boolean ,
  message : Message ,
  values : value[] ,
  interaction : Interaction
}
// (Message | ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuBuilder | ContextMenuCommandInteraction) 
export async function  MenuPages(
  
    data :  {pages : {label:string, value:(string | number | any), Description?:string,Emoji?:string , default ? : boolean}[] ,
    MenuPlaceholder : string ,
    message:{menuReply ?:boolean,menuEphemeral?:boolean, ephemeral?  : boolean,messageEdit ?: boolean ,interaction : (ChatInputCommandInteraction), message ?: any  , editReply ?: boolean , edit ?: boolean , followUp ?: boolean , reply ?: boolean , content ?: string , embeds ?: EmbedBuilder[]},
    menueLimts : {MinValues : number  , MaxValues : number  } , save :boolean  , cancel : boolean    , collectorTime? : number
  },
  )  {
    
        let menuValues = []
        let selectedValues = 0
        let pagesList = pageCreator(data.pages , 25 , menuValues)
        let nextButton = new ButtonBuilder().setCustomId("nextButton"+data.message.interaction.user.id ).setStyle(ButtonStyle.Primary).setEmoji("➡")
        let previousButton = new ButtonBuilder().setCustomId("previousButton"+data.message.interaction.user.id ).setStyle(ButtonStyle.Primary).setEmoji("⬅")
        let saveBtn = new ButtonBuilder().setCustomId("saveBtn"+data.message.interaction.user.id ).setEmoji("✔️").setStyle(ButtonStyle.Success)
        let cancelBtn = new ButtonBuilder().setCustomId("cancelBtn"+data.message.interaction.user.id ).setEmoji("✖").setStyle(ButtonStyle.Danger)
        let buttonsRow = new ActionRowBuilder<ButtonBuilder>()
        
        if(pagesList.length > 1) {buttonsRow.addComponents(previousButton);if(data.save)  buttonsRow.addComponents(saveBtn);if(data.cancel) buttonsRow.addComponents(cancelBtn); buttonsRow.addComponents(nextButton);
        } else {if(data.save)  buttonsRow.addComponents(saveBtn); if(data.cancel) buttonsRow.addComponents(cancelBtn);}

      let currentPage = 0
      let MaxValues = data.menueLimts.MaxValues == 0?pagesList[currentPage].length:pagesList[currentPage].length > data.menueLimts.MaxValues?data.menueLimts.MaxValues:pagesList[currentPage].length;
      let Menu = new StringSelectMenuBuilder().setCustomId("pages'Menu"+data.message.interaction.user.id ).setMaxValues(MaxValues).setMinValues(data.menueLimts.MinValues).setPlaceholder(data.MenuPlaceholder);
      pagesList[currentPage]?.map((a: { label: string; value: string; Description: string; Emoji: ComponentEmojiResolvable }) => {Menu.addOptions ({label : a?.label?a?.label:undefined, value : a?.value?a?.value:undefined, description : a?.Description?a?.Description:undefined,emoji : a?.Emoji?a?.Emoji:undefined})})
      let menueRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(Menu)
      let components = [];buttonsRow.components.length > 0 ?components.push(menueRow,buttonsRow):components.push(menueRow);

      let MsgCollected : Message;
      if(data.message.followUp && data.message.message) MsgCollected = await data.message.message.followUp({components : components , ephemeral : data.message.ephemeral , content : data.message?.content , embeds : data.message?.embeds});
      else if(data.message.editReply&& data.message.message) MsgCollected = await data.message.message.editReply({components : components , content : data.message?.content , embeds : data.message?.embeds})
      else if (data.message.edit&& data.message.message)  MsgCollected = await data.message.message.edit({components : components, content : data.message?.content , embeds : data.message?.embeds})
      else if(data.message.reply && data.message.message)  MsgCollected = await data.message.message.reply({components : components , ephemeral : data.message.ephemeral , content : data.message?.content , embeds : data.message?.embeds})
      const Filter =  (i: ButtonInteraction) => i.user.id === data.message.interaction.user.id && ["nextButton"+data.message.interaction.user.id , "previousButton"+data.message.interaction.user.id  , "saveBtn"+data.message.interaction.user.id  , "cancelBtn"+data.message.interaction.user.id ,"pages'Menu"+data.message.interaction.user.id ].includes(i.customId) ;
      
      let collector = MsgCollected.createMessageComponentCollector({time : data.collectorTime? data.collectorTime : 600000, filter : Filter})
      
      return new Promise( async (resolve, reject) => { 
        collector.on("collect" , async (interaction : ( StringSelectMenuInteraction)) => {     
          if(data.message.menuReply)      await interaction.deferReply({ephemeral : data.message.menuEphemeral}) 
          else await interaction.deferUpdate()        
          switch (interaction.customId) {
            case "nextButton"+data.message.interaction.user.id :
              currentPage ++
              if(currentPage + 1 >  pagesList.length) currentPage = 0;
              MsgCollected =await changeMenue({ pagesList ,currentPage ,  Menu , components , buttonsRow , menueRow , MsgCollected,data , menuValues , MaxValues })
              break;
          
            case  "previousButton"+data.message.interaction.user.id :
              currentPage--
              if(currentPage < 0) currentPage = pagesList.length -1
              MsgCollected =await changeMenue({ pagesList ,currentPage ,  Menu , components , buttonsRow , menueRow , MsgCollected,data , menuValues , MaxValues })              
              break;
            case  "saveBtn"+data.message.interaction.user.id :
            collector.stop()
            resolve({ saved : true , message : MsgCollected , values : menuValues ,  interaction : interaction})
              break;
            
            case  "cancelBtn"+data.message.interaction.user.id  : 
              collector.stop()
              resolve({canceled : true , message : MsgCollected})
              break;
            
            case "pages'Menu"+data.message.interaction.user.id :                          
              menuValues[currentPage].map((a : value ,i : number) => {if(!interaction.values.includes(a.value)) {menuValues[currentPage].splice(i,1);                  selectedValues--}})      
              let addData = interaction.values.map((a, i) => {if(menuValues[currentPage].find((e : value) => e.value === a)) return; if(selectedValues === MaxValues) return {MaxValues : true} ;menuValues[currentPage].push({value  : a , default : true});selectedValues ++})
              if(addData.find(a => a?.MaxValues === true && data.menueLimts.MaxValues !== 0)) {resolve({MaxValues : true,  saved : true , message : MsgCollected , values : menuValues ,  interaction : interaction});collector.stop()}
              if(selectedValues === MaxValues && data.menueLimts.MaxValues !== 0) {resolve({MaxValues : true,  saved : true , message : MsgCollected , values : menuValues ,  interaction : interaction});collector.stop() }
              
              break;
          }
        })


        collector.on("end" , async (intraction) => {
          resolve({timeOut : true})
        })
      });
     



      
      
      
      
      
} ;









async function changeMenue({ pagesList ,currentPage ,  Menu , components , buttonsRow , menueRow , MsgCollected , data , menuValues , MaxValues  }) {
  MaxValues = data.menueLimts.MaxValues == 0?pagesList[currentPage].length:pagesList[currentPage].length > data.menueLimts.MaxValues?data.menueLimts.MaxValues:pagesList[currentPage].length;
  Menu.setOptions([])
  Menu.setMaxValues(MaxValues)
  pagesList[currentPage]?.map((a: value) => {Menu.addOptions ({label : a?.label?a?.label:undefined, value : a?.value?a?.value:undefined, description : a?.Description?a?.Description:undefined,emoji : a?.Emoji?a?.Emoji:undefined , default : menuValues[currentPage].find((b:value) => b?.value == a?.value)?true:false  })})
  components = []
  buttonsRow.components.length > 0 ?components.push(menueRow,buttonsRow):components.push(menueRow);
  if(data.message.followUp && data.message.message) MsgCollected = await data.message.message.followUp({components : components , ephemeral : data.message.ephemeral});
  else if(data.message.editReply&& data.message.message) MsgCollected = await data.message.message.editReply({components : components})
  else if (data.message.edit&& data.message.message)  MsgCollected = await data.message.message.edit({components : components})
  else if(data.message.reply && data.message.message)  MsgCollected = await data.message.message.edit({components : components , ephemeral : data.message.ephemeral , })
return MsgCollected
}
function pageCreator(data : Object[] , pageLimit:number , menuValues ) {

    let pagesList = []
    let pagesCount = Math.ceil(data.length / pageLimit)
    let index = 0
    let pagearry = []
    for (let page = 0 ; page < pagesCount ; page ++) 
    {
      for (let i = 0 ; i < pageLimit ; i++) {
        if(index < data.length) {
            pagearry.push(data[index])
            index ++
        }
      }
      menuValues.push([])
      pagesList.push(pagearry)
      pagearry = []
    }
  return pagesList
  }