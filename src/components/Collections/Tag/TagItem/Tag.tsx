"use client";
import clsx from "clsx";
import { X } from "lucide-react";
import {
  Tag as AriaTag,
  Button,
  type TagProps,
} from "react-aria-components/TagGroup";
import utils from "@/styles/utilities.module.css";
import styles from "./Tag.module.css";

export interface TagItemProps extends Omit<TagProps, "children"> {
  /** The tag's content. When a string, it is also used as the tag's text value. */
  children?: React.ReactNode;
}

/**
 * A single chip within a TagGroup. Renders its label and, when the group is
 * removable, a trailing remove button. Sizing and shape are driven by the
 * parent TagGroup's `size` and `variant` props.
 */
export function Tag({ children, ...props }: TagItemProps) {
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
