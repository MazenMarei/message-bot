
import mongoose from "mongoose";
const Button = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    ID : {
        type: String,
    },
    data : Object,
    message : String,
    webhook : String,
    
}, { timestamps: { createdAt: 'Created at' }});

export default  mongoose.model('Buttons', Button);