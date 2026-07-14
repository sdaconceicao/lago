"use client";
import { type Context, useContext } from "react";
import { Group, type GroupProps } from "react-aria-components/Group";

interface OpenableState {
  setOpen: (isOpen: boolean) => void;
}

export interface FieldGroupProps<S extends OpenableState> extends GroupProps {
  /**
   * The picker's state context — `DatePickerStateContext` or
   * `DateRangePickerStateContext`.
   */
  stateContext: Context<S | null>;
}

/**
 * The field container for a date picker. Clicking anywhere inside it opens the
 * calendar, except the editable date segments (the numbers), which keep their
 * normal click-to-edit behavior, and the trigger button, which toggles the
 * popover itself. This makes the whole field a large, convenient hit target
 * without stealing clicks meant for typing a date.
 */
export function FieldGroup<S extends OpenableState>({
  stateContext,
  ...props
}: FieldGroupProps<S>) {
  const state = useContext(stateContext);
  return (
    <Group
      {...props}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        // The trigger button toggles the popover on its own.
        if (target.closest("button")) return;
        // Editable segments (month/day/year) stay click-to-edit; literal
        // segments (separators like "/") fall through to open the calendar.
        const segment = target.closest(".react-aria-DateSegment");
        if (segment && segment.getAttribute("data-type") !== "literal") return;
        e.preventDefault();
        state?.setOpen(true);
      }}
    />
  );
}
