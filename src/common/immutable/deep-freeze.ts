export function deepFreeze(state: any): void {
  for (const key in state) {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      const subState = state[key];
      if (subState === undefined) {
        state[key] = null;
      }
      if (subState === Object(subState)) {
        deepFreeze(subState);
      }
    }
  }
  Object.freeze(state);
}
