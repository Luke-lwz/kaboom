export function promiser() {
    var promiseResolve, promiseReject;

    const promise = new Promise(function (resolve, reject) {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    return {promise, promiseResolve, promiseReject};
}





