
import mongoose from "mongoose";
const Button = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    ID : {
        type: String,
    },
    btnID : {
      type: Number,
    },
    data : Object,
    message : String,
    webhook : String,
    type : String,
}, { timestamps: { createdAt: 'Created at' }});

export default  mongoose.model('Buttons', Button);