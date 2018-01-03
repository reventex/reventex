import { CommandType } from './CommandType';
import { symbol } from './symbol';

export async function iterate(commandExecutorMap, iterator, context) {
    const { resolve, reject, matches } = context;

    let command, step, result;

    while (true) {
        step = iterator.next(result);
        if (step.done) {
            return;
        }
        command = step.value;

        if (command[symbol] === CommandType.EXIT) {
            while (matches.length > 0) {
                matches.pop();
            }
            resolve();
            break;
        }

        const commandExecutor = commandExecutorMap[command[symbol]];
        if (commandExecutor) {
            result = await commandExecutor(command, context);
        } else {
            reject(new Error('Unknown command'));
        }
    }
}
