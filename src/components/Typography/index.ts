// `Heading` and `Text` render on the server: plain elements with Lago's type
// styles, no client boundary. The `Slotted*` variants add react-aria's slot
// lookup — which is what makes them client components — and are only needed
// when a surrounding container names the element (a Dialog title, a field
// description). See Heading for the full reasoning.
export { Heading, type HeadingProps } from "./Heading/Heading";
export {
  SlottedHeading,
  type SlottedHeadingProps,
} from "./Heading/SlottedHeading";
export { SlottedText, type SlottedTextProps } from "./Text/SlottedText";
export { Text, type TextProps } from "./Text/Text";
