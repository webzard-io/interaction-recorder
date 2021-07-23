import { MatcherElement } from "./types";

export const isInputLikeElement = (element: MatcherElement): boolean => {
  switch (element.tagName) {
    case 'INPUT': {
      const disabled = 'disabled' in element.attributes;
      const { type } = element.attributes;
      // input element which is not disabled and editable is an input like element
      return (
        !disabled &&
        ![
          'button',
          'checkbox',
          'color',
          'file',
          'image',
          'radio',
          'range',
          'reset',
          'submit',
        ].includes(type)
      );
    }
    case 'TEXTAREA': {
      //  textarea element not disabled
      return 'disabled' in element.attributes;
    }
    default:
      // contenteditble element
      return (
        'contentEditable' in element.attributes &&
        ['true', '', 'caret', 'events', 'plaintext', 'typing'].includes(
          element.attributes['contentEditable'],
        )
      );
  }
};
