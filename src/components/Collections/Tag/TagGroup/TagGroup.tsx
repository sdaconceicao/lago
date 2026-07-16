"use client";
import clsx from "clsx";
import {
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
  TagList,
  type TagListProps,
} from "react-aria-components/TagGroup";
import { Description, Label } from "@/components/Inputs/FormComponents/index";
import { Text } from "@/components/Typography/index";
import styles from "./TagGroup.module.css";

export interface TagGroupProps<T>
  extends
    Omit<AriaTagGroupProps, "children">,
    Pick<TagListProps<T>, "items" | "children" | "renderEmptyState"> {
  /** Accessible label rendered above the tags. */
  label?: string;
  /** Helper text rendered below the tags. */
  description?: string;
  /** Error message rendered below the tags. */
  errorMessage?: string;
  /** The size variant of the tags. "sm" (default) renders compact chips, "md" renders field-height chips. */
  size?: "sm" | "md";
  /** The shape variant of the tags. "default" uses the same border radius as inputs, "round" renders fully rounded pill chips. */
  variant?: "default" | "round";
}

/**
 * A labeled list of Tag chips. Manages selection, keyboard navigation, and
 * removal for its child Tags, and exposes `size` and `variant` props that style
 * the chips it contains.
 */
export function TagGroup<T>({
  label,
  description,
  errorMessage,
  items,
  children,
  renderEmptyState,
  size = "sm",
  variant = "default",
  ...props
}: TagGroupProps<T>) {
  return (
    <AriaTagGroup
      {...props}
      data-size={size}
      data-variant={variant}
      className={clsx("react-aria-TagGroup", styles.tagGroup)}
    >
      {label && <Label>{label}</Label>}
      <TagList
        className={clsx("react-aria-TagList", styles.tagList)}
        items={items}
        renderEmptyState={renderEmptyState}
      >
        {children}
      </TagList>
      {description && <Description>{description}</Description>}
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaTagGroup>
  );
}
