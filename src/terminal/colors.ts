const ESC = '\x1b[';
const RESET = `${ESC}0m`;

function wrap(code: string) {
  return (text: string) => `${ESC}${code}m${text}${RESET}`;
}

export const green = wrap('32');
export const dimGray = wrap('90');
export const cyan = wrap('36');
export const red = wrap('31');
export const bold = wrap('1');
export const yellow = wrap('33');
export const linkStyle = wrap('4;36'); // underline + cyan
