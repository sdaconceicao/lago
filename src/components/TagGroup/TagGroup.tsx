"use client";
import clsx from "clsx";
import { X } from "lucide-react";
import {
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
  Button,
  TagList,
  type TagListProps,
  type TagProps,
} from "react-aria-components/TagGroup";
import { Text } from "../Content/Content";
import { Description, Label } from "../Inputs/Form/Form";
import utils from "../../styles/utilities.module.css";
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

export function Tag({
  children,
  ...props
}: Omit<TagProps, "children"> & {
  children?: React.ReactNode;
}) {
  const textValue = typeof children === "string" ? children : undefined;
  return (
    <AriaTag
      textValue={textValue}
      {...props}
      className={clsx("react-aria-Tag", utils.buttonBase, styles.tag)}
    >
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && (
            <Button slot="remove" className={styles.removeButton}>
              <X />
            </Button>
          )}
        </>
      )}
    </AriaTag>
  );
}
