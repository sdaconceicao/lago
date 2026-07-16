import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A set of layered sections of content, known as tab panels, that are displayed one at a time. A TabList of Tab elements lets the user switch between panels (TabPanels), with built-in keyboard navigation and roving focus.",
      },
    },
  },
  args: {
    onSelectionChange: fn(),
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof Tabs>;

export const Example: Story = (args) => (
  <Tabs {...args}>
    <TabList aria-label="History of Ancient Rome">
      <Tab id="FoR">Founding of Rome</Tab>
      <Tab id="MaR">Monarchy and Republic</Tab>
      <Tab id="Emp">Empire</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </TabPanel>
      <TabPanel id="MaR">Senatus Populusque Romanus.</TabPanel>
      <TabPanel id="Emp">Alea jacta est.</TabPanel>
    </TabPanels>
  </Tabs>
);
