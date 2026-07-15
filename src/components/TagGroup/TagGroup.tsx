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
import { Description, Label } from "../Form/Form";
import utils from "../../styles/utilities.module.css";
import styles from "./TagGroup.module.css";

export interface TagGroupProps<T>
  extends
    Omit<AriaTagGroupProps, "children">,
    Pick<TagListProps<T>, "items" | "children" | "renderEmptyState"> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function TagGroup<T>({
  label,
  description,
  errorMessage,
  items,
  children,
  renderEmptyState,
  ...props
}: TagGroupProps<T>) {
  return (
    <AriaTagGroup
      {...props}
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
