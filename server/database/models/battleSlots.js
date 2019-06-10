const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Define userSchema
const battleSlotSchema = new Schema({

    initiatorId: { type: String, unique: true, required: true },
    initiatorName: { type: String, unique: false, required: true },
    openBattle: { type: Boolean, unique: false, required: false, default: null },
    challenger: { type: String, unique: false, required: false, default: null },
    challengers: { type: Object, unique: false, required: false, default: {} },
    challengeAccepted: { type: Boolean, unique: false, required: false, default: false },

})

const BattleSlot = mongoose.model('BattleSlot', battleSlotSchema)
module.exports = BattleSlot