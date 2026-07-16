"use client";
import { useEffect } from "react";
import clsx from "clsx";
import {
  Autocomplete as AriaAutocomplete,
  type AutocompleteProps as AriaAutocompleteProps,
  useFilter,
} from "react-aria-components/Autocomplete";
import { Dialog } from "react-aria-components/Dialog";
import { type MenuProps as AriaMenuProps } from "react-aria-components/Menu";
import { Menu } from "@/components/Actions/Menu/Menu";
import { SearchField } from "@/components/Inputs/SearchField/SearchField";
import { Modal } from "@/components/Overlays/Modal/Modal";
import styles from "./CommandPalette.module.css";

export interface CommandPaletteProps<T>
  extends Omit<AriaAutocompleteProps, "children">, AriaMenuProps<T> {
  isOpen: boolean;
  onOpenChange: (isOpen?: boolean) => void;
}

export function CommandPalette<T>(props: CommandPaletteProps<T>) {
  const { isOpen, onOpenChange } = props;
  const { contains } = useFilter({ sensitivity: "base" });

  useEffect(() => {
    const isMacUA = /mac(os|intosh)/i.test(navigator.userAgent);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j" && (isMacUA ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  return (
    <Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog
        className={clsx("command-palette-dialog", styles.commandPaletteDialog)}
      >
        <AriaAutocomplete filter={contains} {...props}>
          <SearchField
            autoFocus
            aria-label="Search commands"
            placeholder="Search commands"
          />
          <Menu {...props} renderEmptyState={() => "No results found."} />
        </AriaAutocomplete>
      </Dialog>
    </Modal>
  );
}
