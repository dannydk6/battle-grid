exports.roll = function(stats) {
    const rolls = {}
    for (let key in stats) {
        let high = stats[key]
        let roll = getRandomInt(1, high)
        rolls[key] = roll
    }
    return rolls
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}