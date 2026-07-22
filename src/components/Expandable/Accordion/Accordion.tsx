"use client";
import clsx from "clsx";
import {
  type DisclosurePanelProps,
  type DisclosureProps,
  type HeadingProps,
} from "react-aria-components/Disclosure";
import {
  type DisclosureGroupProps,
  DisclosureGroup as RACDisclosureGroup,
} from "react-aria-components/DisclosureGroup";
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
} from "@/components/Expandable/Disclosure/Disclosure";
import styles from "./Accordion.module.css";

/**
 * Props for the Accordion component. Extends React Aria's DisclosureGroup props.
 */
export interface AccordionProps extends DisclosureGroupProps {
  /** Allows more than one item to be expanded at the same time. Defaults to false, so opening an item collapses the others. */
  allowsMultipleExpanded?: boolean;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
}

/**
 * A vertically stacked set of collapsible items built on Disclosure and
 * DisclosureGroup. Compose it from `Accordion.Item`, `Accordion.Header`, and
 * `Accordion.Panel`. By default only one item can be open at a time; set
 * `allowsMultipleExpanded` to let several stay open together.
 */
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <RACDisclosureGroup
      {...props}
      className={clsx("accordion", styles.accordion, className)}
    />
  );
}

/**
 * A single collapsible item within an Accordion. Wraps a Disclosure and
 * requires a unique `id` so the Accordion can track its expanded state.
 */
export function AccordionItem({ className, ...props }: DisclosureProps) {
  return (
    <Disclosure
      {...props}
      className={clsx("accordion-item", styles.accordionItem, className)}
    />
  );
}

/**
 * The clickable header/trigger for an AccordionItem. Renders the item's title
 * and toggles its panel open or closed.
 */
export function AccordionHeader({ className, ...props }: HeadingProps) {
  return (
    <DisclosureHeader
      {...props}
      className={clsx("accordion-header", styles.accordionHeader, className)}
    />
  );
}

/**
 * The expandable content region of an AccordionItem, revealed when its header
 * is activated.
 */
export function AccordionPanel({ className, ...props }: DisclosurePanelProps) {
  return (
    <DisclosurePanel
      {...props}
      className={clsx("accordion-panel", styles.accordionPanel, className)}
    />
  );
}

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;
