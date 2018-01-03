export function unsubscribe(effect, context) {
    const { bus, subscriptions } = context;

    const nextSubscriptions = subscriptions.filter(
        ({ channel }) => channel !== effect.channel,
    );

    for (const { channel, sid } of subscriptions) {
        if (channel === effect.channel) {
            bus.unsubscribe(sid);
        }
    }

    context.subscriptions = nextSubscriptions;
}
