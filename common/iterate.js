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

        if (command && command[symbol] === CommandType.EXIT) {
            while (matches.length > 0) {
                matches.pop();
            }
            resolve();
            return;
        }

        const commandExecutor = command && commandExecutorMap[command[symbol]];
        if (commandExecutor) {
            try {
                result = await commandExecutor(command, context);
            } catch (error) {
                while (matches.length > 0) {
                    matches.pop();
                }
                reject(error);
                return;
            }
        } else {
            while (matches.length > 0) {
                matches.pop();
            }
            reject(new Error('Unknown command'));
            return;
        }
    }
}
