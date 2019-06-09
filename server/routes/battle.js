const express = require('express')
const router = express.Router()
const BattleSlot = require('../database/models/battleSlots')

router.post('/', (req, res) => {
    console.log('battleSlot check');
    if (req.user) {
        const { username, _id } = req.body
        BattleSlot.findOne({ initiatorId: _id }, (err, user) => {
            if (err) {
                console.log('battleSlot post error: ', err)
            } else if (user) {
                res.json({
                    error: `Sorry, already a battle with initiator: ${username} ${_id}`
                })
            } else {
                const newBattleSlot = new BattleSlot({
                    initiatorName: username,
                    initiatorId: _id
                })
                newBattleSlot.save((err, savedBat) => {
                    if (err) return res.json(err)
                    res.json(savedBat)
                })
            }
        })
    }
})

router.post('/delete', (req, res) => {
    console.log('battleSlot delete check');
    if (req.user) {
        const { username, _id } = req.body
        BattleSlot.remove({ initiatorId: _id }, (err, battle) => {
            if (err) {
                console.log('battleSlot post error: ', err)
                res.json({
                    error: `Sorry, no battle available with these terms: ${username} ${_id}`
                })
            } else if (battle) {
                res.json({ message: 'success', battle })
            } else {
                res.json({
                    error: `Sorry, no battle available with these terms: ${username} ${_id}`
                })
            }
        })
    } else {
        res.json({ err: 'You are not authorized to view battles.' })
    }
})

router.get('/', (req, res, next) => {
    if (req.user) {
        BattleSlot.find({}, (err, battles) => {
            if (err) {
                console.log('battleSlot err', err)
            }

            //console.log(battles)
            res.json({ data: battles })
        })
    } else {
        res.json({ err: 'You are not authorized to view battles.' })
    }
})

module.exports = router