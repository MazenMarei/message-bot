
import mongoose from "mongoose";
import config from "../config.js";
const Button = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    ID : {
        type: String,
    },
    type : {
        type :String
    },
    data : {
        type : Object
    }

    
}, { timestamps: { createdAt: 'Created at' }});

export default  mongoose.model('Buttons', Button);