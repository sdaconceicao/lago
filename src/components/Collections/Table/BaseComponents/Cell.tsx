"use client";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import {
  Cell as AriaCell,
  Button,
  type CellProps,
} from "react-aria-components/Table";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import styles from "../Table.module.css";

export type { CellProps };

export function Cell(props: CellProps) {
  return (
    <AriaCell
      {...props}
      className={props.className ?? clsx("react-aria-Cell", styles.cell)}
    >
      {composeRenderProps(
        props.children,
        (children, { hasChildItems, isTreeColumn }) => (
          <>
            {isTreeColumn && hasChildItems && (
              <Button
                slot="chevron"
                className={clsx("react-aria-Button", styles.chevronButton)}
              >
                <ChevronRight />
              </Button>
            )}
            {children}
          </>
        )
      )}
    </AriaCell>
  );
}
