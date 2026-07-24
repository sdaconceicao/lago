"use client";
import clsx from "clsx";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  TabPanels as RACTabPanels,
  Tabs as RACTabs,
  SelectionIndicator,
  type TabListProps,
  type TabPanelProps,
  type TabPanelsProps,
  type TabProps,
  type TabsProps,
} from "react-aria-components/Tabs";
import styles from "./Tabs.module.css";

export function Tabs(props: TabsProps) {
  return (
    <RACTabs
      {...props}
      className={clsx("react-aria-Tabs", styles.tabs, props.className)}
    />
  );
}

export function TabList<T>(props: TabListProps<T>) {
  return (
    <RACTabList
      {...props}
      className={clsx("react-aria-TabList", styles.tabList, props.className)}
    />
  );
}

export function Tab(props: TabProps) {
  return (
    <RACTab
      {...props}
      className={clsx("react-aria-Tab", styles.tab, props.className)}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <SelectionIndicator
            className={clsx("react-aria-SelectionIndicator")}
          />
        </>
      ))}
    </RACTab>
  );
}

export function TabPanels<T>(props: TabPanelsProps<T>) {
  return (
    <RACTabPanels
      {...props}
      className={clsx(
        "react-aria-TabPanels",
        styles.tabPanels,
        props.className
      )}
    />
  );
}

export function TabPanel(props: TabPanelProps) {
  return (
    <RACTabPanel
      {...props}
      className={clsx("react-aria-TabPanel", styles.tabPanel, props.className)}
    />
  );
}
