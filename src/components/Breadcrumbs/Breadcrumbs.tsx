"use client";
import { ChevronRight } from "lucide-react";
import {
  type BreadcrumbProps,
  type BreadcrumbsProps,
  Link,
  type LinkProps,
  Breadcrumb as RACBreadcrumb,
  Breadcrumbs as RACBreadcrumbs,
} from "react-aria-components/Breadcrumbs";
import "./Breadcrumbs.css";

export function Breadcrumbs<T>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}

export function Breadcrumb(
  props: BreadcrumbProps & Omit<LinkProps, "className">
) {
  return (
    <RACBreadcrumb {...props}>
      {({ isCurrent }) => (
        <>
          <Link {...props} />
          {!isCurrent && <ChevronRight size={14} />}
        </>
      )}
    </RACBreadcrumb>
  );
}
