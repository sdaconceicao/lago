"use client";
import {
  type DisclosureGroupProps,
  DisclosureGroup as RACDisclosureGroup,
} from "react-aria-components/DisclosureGroup";
import "./DisclosureGroup.css";

export function DisclosureGroup(props: DisclosureGroupProps) {
  return <RACDisclosureGroup {...props} />;
}
