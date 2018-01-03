export function match(effect, { matches }) {
    matches.push({
        pattern: effect.pattern,
        generator: effect.generator,
    });
}
