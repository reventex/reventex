export function publish(effect, { bus }) {
    return new Promise(resolve => {
        const message = JSON.stringify(effect.event);
        bus.publish(effect.event.channel, message, () => resolve());
    });
}
