"use client";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import {
  type BreadcrumbProps,
  type BreadcrumbsProps,
  Link,
  type LinkProps,
  Breadcrumb as RACBreadcrumb,
  Breadcrumbs as RACBreadcrumbs,
} from "react-aria-components/Breadcrumbs";
import styles from "./Breadcrumbs.module.css";

export function Breadcrumbs<T>(props: BreadcrumbsProps<T>) {
  return (
    <RACBreadcrumbs
      {...props}
      className={clsx(
        "react-aria-Breadcrumbs",
        styles.breadcrumbs,
        props.className
      )}
    />
  );
}

export function Breadcrumb(
  props: BreadcrumbProps & Omit<LinkProps, "className">
) {
  return (
    <RACBreadcrumb
      {...props}
      className={clsx("react-aria-Breadcrumb", styles.breadcrumb)}
    >
      {({ isCurrent }) => (
        <>
          <Link {...props} className={clsx("react-aria-Link", styles.link)} />
          {!isCurrent && <ChevronRight size={14} />}
        </>
      )}
    </RACBreadcrumb>
  );
}
