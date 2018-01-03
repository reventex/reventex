const isWord = /^[A-Za-z][A-Za-z0-9_-]*$/;
const isStar = /^\*$/;
const isGt = /^>$/;

export function MatchRegExp(pattern) {
    const items = pattern.trim().split('.');
    let reqExp = '^';
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (index > 0) {
            reqExp += '.';
        }
        if (isWord.test(item)) {
            reqExp += item.replace(/\-/g, '-');
        } else if (isStar.test(item)) {
            reqExp += '[^.>]+';
        } else if (isGt.test(item)) {
            if (index === items.length - 1) {
                reqExp += '.+';
            } else {
                throw new Error(
                    '">" matches any length of the tail of a subject, and can only be the last token',
                );
            }
        } else {
            throw new Error(
                `Incorrect expression "${item}" in pattern "${pattern}"`,
            );
        }
    }
    reqExp += '$';
    return new RegExp(reqExp);
}
