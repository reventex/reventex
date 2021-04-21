# [<img src="https://user-images.githubusercontent.com/5055654/32693118-30bc25b6-c736-11e7-99c5-48c80e1c52b9.png" height="60">](https://github.com/reventex/reventex)

[![Build Status](https://github.com/reventex/reventex/actions/workflows/master.yml/badge.svg?branch=master)](https://github.com/reventex/reventex/actions/workflows/master.yml) [![npm version](https://badge.fury.io/js/reventex.svg)](https://www.npmjs.com/package/reventex) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/reventex/reventex/blob/master/LICENSE)

Full stack Event Sourcing, DDD framework for Node.js

## NPM

Reventex is published on NPM with full typing support. To install use

```bash 
npm install reventex
```

This will allow you to import Reventex entirely using:

```js
import { projection } from 'reventex/server';
```

## Terminology

#### Entity
The target of a process. In Bookings, a booking. In Customer Payments, a payment.

#### Event
A fact that something happened. Booking was created, order was received, a step was unsuccessful.

#### Event Handler
A reaction to an event that has occurred. An order was received, reduce the inventory count by 1.

#### Applicator
Over time, the current state of an entity changes. A booking can go from booked to cancelled. An applicator, takes each event, extracts the interesting information out and applies it to a model.

#### Projection
The result of iterating through all of the applicators is the projection of the model.

#### Saga 
Is responsible for the flow of the process. Can take wait for multiple events to occur, then continue on with the process. The implementation of what is usually drawn in a sequence diagram. For example, The process will not take charge a customer until all the items in the shopping cart are reserved(a parallel process).

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
