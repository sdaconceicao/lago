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
import { TableCell } from "../Cell/Cell";
import styles from "./Row.module.css";

export type { RowProps };

export function TableRow<T>({
  id,
  columns,
  children,
  ...otherProps
}: RowProps<T>) {
  const { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    <AriaRow
      id={id}
      {...otherProps}
      className={clsx("react-aria-Row", styles.row, otherProps.className)}
    >
      {allowsDragging && (
        <TableCell>
          <Button
            slot="drag"
            className={clsx("drag-button", styles.dragButton)}
          >
            <GripVertical />
          </Button>
        </TableCell>
      )}
      {selectionBehavior === "toggle" && (
        <TableCell>
          <Checkbox slot="selection" />
        </TableCell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}
