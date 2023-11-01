import { BitField, ButtonInteraction, GuildTextBasedChannel, MessageFlags, MessageFlagsBitField } from "discord.js";
import { MenuPages } from "../utils/menue.js";

export default {
    id: "customBtn", 
    name : "customBtn",// button custom id here
    permissions: ["0"],
    roleRequired: "",
    function: async function ({ button }: { button: ButtonInteraction }) {
        const { client } = await import("../index.js");
        let Msg = await button.deferReply({ephemeral : true}); 
        // let menue = await MenuPages(
        //     {pages : (await button.guild.roles.fetch()).map(e => ({label : e.name , value : e.id , Description : "" , Emoji : ""})) ,
        //     MenuPlaceholder :  "asdasd" , message : {ephemeral : true , message :  Msg as any ,edit : true , interaction : button  } ,
        //     menueLimts : {MinValues : 1 , MaxValues : 0} ,
        //     save : true , cancel : false ,
        // })

    // console.log(menue);
    




    },
} as any;
