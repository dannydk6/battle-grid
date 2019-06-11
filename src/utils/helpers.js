export function groupBy(array, fn) {
    return array.reduce((result, item) => {
        const key = fn(item);
        if (!result[key]) result[key] = [];
        result[key].push(item);
        return result;
    }, {})
};

export function makeCancelable(promise) {
    let hasCanceled_ = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            val => hasCanceled_ ? reject({ isCanceled: true }) : resolve(val),
            error => hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
};

export const deckStyle = {
    width: '100%',
    display: 'flex',
    marginTop: '10px',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center'
}