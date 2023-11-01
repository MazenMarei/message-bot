import { ActionRowBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuBuilder,Collection, GuildMember, AutocompleteInteraction, SlashCommandBuilder, Interaction } from "discord.js";
import { client } from "../../index.js";
import { log } from "../../utils/logging.js";

 
export default {

	name: "webhook",
	description: "To control with webhooks and manage it.",
	permissions: ["0"],
	roleRequired: "", // id here
	cooldown: 0, // in ms
	options: 
	[
		// {name : "webhook", description : "To control with webhooks and manage it.", type : ApplicationCommandOptionType.String , required : true , focused : true , autocomplete : true},
		{name : "create"    ,description : "لانشاء ويب هوك", type : ApplicationCommandOptionType.Subcommand ,  options : [
			{ name: "name",  description: "لتعين اسم الويب هوك",  required: true, type: ApplicationCommandOptionType.String },
			{ name: "channel", description: "الروم التي يتم ارسال الويب هوك بها وارسال الرسائل بها",     required : false, type: ApplicationCommandOptionType.Channel  },
			{ name: "avatar", description: "صورة الويب هوك",    required: false, type: ApplicationCommandOptionType.Attachment  },
		] },

		{name : "delete", description : "لحذف الويب هوك" , type : ApplicationCommandOptionType.Subcommand,focused : true, options : [
			{name : "webhook" , description : "حدد الويب هوك الذي تريد حذفة" , required: true,type: ApplicationCommandOptionType.String  ,focused: true	,autocomplete : true	}
		],},
		{name : "info", description : "لاظهار بينات الويب هوك" , type : ApplicationCommandOptionType.Subcommand,focused : true, options : [
			{name : "webhook" , description : "حدد الويب هوك الذي تريد حذفة" , required: true,type: ApplicationCommandOptionType.String  ,focused: true	,autocomplete : true	}
		],}

	],
	function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
		switch (interaction.options.getSubcommand()) {
            case "create":
               (await import("./webhook-sub/create.js")).default.function({interaction})
                break;
            case "delete":
                (await import("./webhook-sub/delete.js")).default.function({interaction});
                break;
            case "info":
                (await import("./webhook-sub/info.js")).default.function({interaction})
                break;
        }
    },
	autocomplete: async function({ interaction } : {interaction : AutocompleteInteraction}) {
        if (!interaction.inCachedGuild()) return;
        const focusedOption = interaction.options.getFocused(true);
        const focusedValue = interaction.options.getFocused();

		switch (focusedOption.name) {
			case "webhook":
				let data = (await interaction.guild.fetchWebhooks()).filter(a => a.owner.bot == true && a.owner.id == interaction.guild.members.me.id || a.owner.bot == false).map(a => ({name : `#${a.channel.name} : ${a.name} | ${a.owner.username} ` , value : a.id})).slice(0 , 25)
				if(data.length <= 0) data = [{name : "No webhook" , value : "0"}]
				interaction.respond(data)
				break;
		}

    
    },      
};
