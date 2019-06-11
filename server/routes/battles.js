const express = require('express')
const router = express.Router()
const Battle = require('../database/models/battle')

router.get('/:battleId', (req, res, next) => {
    if (req.user) {
        const battleId = req.params.battleId
        Battle.findOne({ _id: battleId }, (err, battle) => {
            if (err) {
                console.log('battleSlot err', err)
            }
            if (battle) {
                res.json({ data: battle })
            } else {
                res.json({ error: 'no battle' })
            }
        })
    } else {
        res.json({ err: 'You are not authorized to view battles.' })
    }
})

module.exports = router