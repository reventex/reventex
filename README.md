# [<img src="https://user-images.githubusercontent.com/5055654/32693118-30bc25b6-c736-11e7-99c5-48c80e1c52b9.png" height="60">](https://github.com/reventex/reventex)

[![Build Status](https://travis-ci.org/reventex/reventex.svg?branch=master)](https://travis-ci.org/reventex/reventex) [![Coverage Status](https://coveralls.io/repos/github/reventex/reventex/badge.svg?branch=master)](https://coveralls.io/github/reventex/reventex?branch=master) [![npm version](https://badge.fury.io/js/reventex.svg)](https://www.npmjs.com/package/reventex) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/reventex/reventex/blob/master/LICENSE)

A Functional Reactive Game Engine

## NPM

Reventex is published on NPM with full typing support. To install use

```bash 
npm install reventex
```

This will allow you to import Reventex entirely using:

```js
import { Bus, Client } from 'reventex/server';
```

## Event-driven architecture

### Bus

The Bus is a one-to-many communication and implements a publish/subscribe event distribution model. A publisher sends a event on a channel. Any active subscriber listening on that channel receives the event. Subscribers can register interest in wildcard channels.

### Client (Subscriber/Publisher)

Subscribers express interest in one or more channels, and only receive events that are of interest, without knowledge of what publishers there are.

Events sent by other clients to these channels will be pushed by Bus to all the subscribed clients.

A client subscribed to one or more channels should not issue commands, although it can subscribe and unsubscribe to and from other channels. The replies to subscription and unsubscription operations are sent in the form of events, so that the client can just read a coherent stream of events where the first element indicates the type of event. The commands that are allowed in the context of a subscribed client are:

* `publish(event: Event): Void`

* `subscribe(channel: String): Void`

* `unsubscribe(channel: String): Void`

* `match(pattern: Pattern, generator: Generator): Void`

* `exit(): Void`

* `delay(ms: Int): Void`

* `call(callback: Function, ...args): Void`

```typescript
type Event = { 
    channel: String,
    type: String,
    payload: Object,    
}
```

```typescript
type Pattern = { channel: String } | { type: String }
```

### Channel Naming Conventions

Channel names, including reply channel names, are case-sensitive and must be non-empty alphanumeric strings with no embedded whitespace, and optionally token-delimited using the dot character (`.`), e.g.:

`FOO`, `BAR`, `foo.bar`, `foo.BAR`, `FOO.BAR` and `FOO.BAR.BAZ` are all valid channel names

`FOO. BAR`, `foo. .bar` and `foo..bar` are not valid channel names

Reventex supports the use of wildcards in channel subscriptions.

* The asterisk character (`*`) matches any token at any level of the channel.
* The greater than symbol (`>`), also known as the full wildcard, matches one or more tokens at the tail of a channel, and must be the last token. The wildcarded channel `foo.>` will match `foo.bar` or `foo.bar.baz.1`, but not `foo`.
* Wildcards must be separate tokens (`foo.*.baz` or `foo.>` are syntactically valid; `foo*.bar`, `f*o.b*r` and `foo>` are not)
For example, the wildcard subscriptions `foo.*.quux` and `foo.>` both match `foo.bar.quux`, but only the latter matches `foo.bar.baz`. With the full wildcard, it is also possible to express interest in every channel that may exist in Reventex.

## Github Issues

Please use [Github Issues](https://github.com/reventex/reventex/issues) to report bugs or request features.

## Reporting bugs

Please follow these steps to report a bug

1. Search for related issues - search the existing issues so that you don't create duplicates

2. Create a testcase - Please create the smallest isolated testcase that you can that reproduces your bug

3. Share as much information as possible - everything little helps, OS, node/browser version, all that stuff.

## Pull Requests
If you are contributing a bug-fix or a very minor addition, feel free to do a pull request on the master branch.

If it is something else create a new (or existing) feature branch (eg: `feature/my-feature`) and issue a pull request on that.

If unsure, create an issue to discuss.

## Contact us
* Twitter: [https://twitter.com/reventexjs](https://twitter.com/reventexjs)

## License
Reventex is released under the [MIT License](./LICENSE).
