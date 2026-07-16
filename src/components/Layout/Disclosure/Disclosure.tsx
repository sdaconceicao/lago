"use client";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { Button } from "react-aria-components/Button";
import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosurePanelProps,
  type DisclosureProps,
  type HeadingProps,
} from "react-aria-components/Disclosure";
import { Heading } from "@/components/Typography/index";
import styles from "./Disclosure.module.css";

export function Disclosure(props: DisclosureProps) {
  return (
    <AriaDisclosure
      {...props}
      className={clsx(
        "react-aria-Disclosure",
        styles.disclosure,
        props.className
      )}
    />
  );
}

export function DisclosureHeader({ children, ...props }: HeadingProps) {
  return (
    <Heading
      {...props}
      className={clsx("react-aria-Heading", styles.heading, props.className)}
    >
      <Button
        slot="trigger"
        className={clsx("react-aria-Button", styles.disclosureButton)}
      >
        <ChevronRight size={16} />
        <span>{children}</span>
      </Button>
    </Heading>
  );
}

export function DisclosurePanel(props: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel
      {...props}
      className={clsx("react-aria-DisclosurePanel", styles.disclosurePanel)}
    >
      <div>{props.children}</div>
    </AriaDisclosurePanel>
  );
}
