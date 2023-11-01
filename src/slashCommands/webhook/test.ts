import { APITextInputComponent, AutocompleteInteraction ,ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle , PermissionFlagsBits, APIEmbed, EmbedData, ButtonComponent, ButtonInteraction, APIMessageComponentButtonInteraction, MessageComponentType, APIActionRowComponent, APIActionRowComponentTypes} from "discord.js";
import Buffer from'buffer';
import buttonInteraction from "../../events/client/buttonInteraction.js";
import { client } from "../../index.js";


export default {
    name: "test",
	description: "test",
	permissions: ["0"],
	roleRequired: "", // id here
	cooldown: 0, // in ms
    function : async function({ interaction }: { interaction: ChatInputCommandInteraction }) {
         let urlBtn = new ButtonBuilder()
         .setCustomId("customBtn1")
         .setLabel("الرابط")
         .setStyle(ButtonStyle.Primary)
         let urlBtn2 = new ButtonBuilder()
         .setCustomId("customBtn2")
         .setLabel("الرابط")
         .setStyle(ButtonStyle.Primary)
         let urlBtn3 = new ButtonBuilder()
         .setCustomId("customBtn3")
         .setLabel("الرابط")
         .setStyle(ButtonStyle.Primary)
         let urlBtn4 = new ButtonBuilder()
         .setCustomId("customBtn4")
         .setLabel("الرابط")
         .setStyle(ButtonStyle.Primary)
         let urlBtn5 = new ButtonBuilder()
         .setCustomId("customBtn5")
         .setLabel("الرابط")
         .setStyle(ButtonStyle.Primary)
        let urlAction = new ActionRowBuilder<ButtonBuilder>().setComponents(urlBtn,urlBtn2,urlBtn3,urlBtn4,urlBtn5)
        // let urlAction2 = new ActionRowBuilder<ButtonBuilder>().setComponents(urlBtn,urlBtn2,urlBtn3,urlBtn4,urlBtn5)
        let InfoMsg = await interaction.reply({ephemeral : true , content : `<a:hehe:1059222897463402566>` , components : [urlAction] })

    }
}