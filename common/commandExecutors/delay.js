export function delay(effect) {
    return new Promise(resolve => {
        setTimeout(resolve, effect.ms);
    });
}
