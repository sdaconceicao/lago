"use client";
import clsx from "clsx";
import { GripVertical } from "lucide-react";
import {
  Row as AriaRow,
  Button,
  Collection,
  type RowProps,
  useTableOptions,
} from "react-aria-components/Table";
import { Checkbox } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import { Cell } from "./Cell";
import styles from "../Table.module.css";

export type { RowProps };

export function Row<T>({ id, columns, children, ...otherProps }: RowProps<T>) {
  const { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    <AriaRow
      id={id}
      {...otherProps}
      className={otherProps.className ?? clsx("react-aria-Row", styles.row)}
    >
      {allowsDragging && (
        <Cell>
          <Button
            slot="drag"
            className={clsx("drag-button", styles.dragButton)}
          >
            <GripVertical />
          </Button>
        </Cell>
      )}
      {selectionBehavior === "toggle" && (
        <Cell>
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}
