export function call(effect) {
    return effect.callback(...effect.args);
}
