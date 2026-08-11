import { Text as AriaText, type TextProps } from "react-aria-components/Text";

export type { TextProps };

export function Text(props: TextProps) {
  return <AriaText {...props} />;
}
