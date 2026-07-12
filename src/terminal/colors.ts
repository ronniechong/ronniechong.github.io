const ESC = '\x1b[';
const RESET = `${ESC}0m`;

function wrap(code: number) {
  return (text: string) => `${ESC}${code}m${text}${RESET}`;
}

export const green = wrap(32);
export const dimGray = wrap(90);
export const cyan = wrap(36);
export const red = wrap(31);
