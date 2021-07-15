// we should use key as identifier of meta key and special key. It is based on logical key.
// code are for physical key.
// href: https://developers.google.com/web/updates/2016/04/keyboardevent-keys-codes
export const MetaKeyMap: Record<string, string> = {
  Alt: 'Alt',
  Control: 'Control',
  Shift: 'Shift',
  Meta: 'Meta',
};

export const SpecialKeyMap: Record<string, string> = {
  Tab: 'Tab',
  Enter: 'Enter',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Insert: 'Insert',
  Delete: 'Delete',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
};

/**
 * to identify if the key is special key
 * @param key key of keyboard event
 * @returns
 */
export const isSpecialKey = (key: string): boolean => {
  return !!SpecialKeyMap[key];
};

/**
 * to identify if the key is meta key
 * @param key key of keyboard event
 * @returns
 */
export const isMetaKey = (key: string): boolean => {
  return !!MetaKeyMap[key];
};
