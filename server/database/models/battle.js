const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Define userSchema
const battleSchema = new Schema({
    initiatorId: { type: String, unique: true, required: true },
    initiatorName: { type: String, unique: false, required: true },
    initiatorCurHP: { type: Number, unique: false, required: true, default: 30 },
    initiatorCurMP: { type: Number, unique: false, required: true, default: 20 },
    initiatorMaxHP: { type: Number, unique: false, required: true, default: 30 },
    initiatorMaxMP: { type: Number, unique: false, required: true, default: 20 },
    openBattle: { type: Boolean, unique: false, required: false, default: true },
    challengerId: { type: String, unique: false, required: false, default: null },
    challengerName: { type: String, unique: false, required: false, default: null },
    challengerCurHP: { type: Number, unique: false, required: true, default: 30 },
    challengerCurMP: { type: Number, unique: false, required: true, default: 20 },
    challengerMaxHP: { type: Number, unique: false, required: true, default: 30 },
    challengerMaxMP: { type: Number, unique: false, required: true, default: 20 },
    battleState: { type: String, unique: false, required: false, default: 'player1' },
    battleSlotId: { type: String, unique: false, required: false },
    winnerId: { type: String, unique: false, required: false },
    winnerName: { type: String, unique: false, required: false },
    actions: { type: Array, unique: false, required: false, default: [] }

})

const Battle = mongoose.model('Battle', battleSchema)
module.exports = Battle