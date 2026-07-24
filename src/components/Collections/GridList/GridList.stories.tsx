import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import {
  GridList,
  GridListHeader,
  GridListItem,
  GridListSection,
  Text,
} from "./GridList";

const meta: Meta<typeof GridList> = {
  component: GridList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A virtualized, grid-based list of items that supports selection, actions, and keyboard navigation. GridList can be organized into sections with headers and is ideal for displaying rich content like image galleries or file browsers in a scrollable, multi-column layout.",
      },
    },
  },
  args: {
    onAction: fn(),
    onSelectionChange: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof GridList>;

export const Example: Story = (args) => (
  <GridList
    {...args}
    style={{ width: 800, maxWidth: "calc(100vw - 80px)" }}
    aria-label="Photos"
  >
    <GridListItem textValue="Desert Sunset">
      <img
        src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Desert Sunset"
        width={600}
        height={400}
      />
      <Text>Desert Sunset</Text>
      <Text slot="description">PNG • 2/3/2024</Text>
    </GridListItem>
    <GridListItem textValue="Hiking Trail">
      <img
        src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Hiking Trail"
        width={600}
        height={900}
      />
      <Text>Hiking Trail</Text>
      <Text slot="description">JPEG • 1/10/2022</Text>
    </GridListItem>
    <GridListItem textValue="Lion">
      <img
        src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Lion"
        width={600}
        height={899}
      />
      <Text>Lion</Text>
      <Text slot="description">JPEG • 8/28/2021</Text>
    </GridListItem>
    <GridListItem textValue="Mountain Sunrise">
      <img
        src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Mountain Sunrise"
        width={600}
        height={900}
      />
      <Text>Mountain Sunrise</Text>
      <Text slot="description">PNG • 3/15/2015</Text>
    </GridListItem>
    <GridListItem textValue="Giraffe tongue">
      <img
        src="https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Giraffe tongue"
        width={600}
        height={900}
      />
      <Text>Giraffe tongue</Text>
      <Text slot="description">PNG • 11/27/2019</Text>
    </GridListItem>
    <GridListItem textValue="Golden Hour">
      <img
        src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Golden Hour"
        width={600}
        height={402}
      />
      <Text>Golden Hour</Text>
      <Text slot="description">WEBP • 7/24/2024</Text>
    </GridListItem>
    <GridListItem textValue="Architecture">
      <img
        src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D"
        alt="Architecture"
        width={600}
        height={900}
      />
      <Text>Architecture</Text>
      <Text slot="description">PNG • 12/24/2016</Text>
    </GridListItem>
    <GridListItem textValue="Peeking leopard">
      <img
        src="https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Peeking leopard"
        width={600}
        height={400}
      />
      <Text>Peeking leopard</Text>
      <Text slot="description">JPEG • 3/2/2016</Text>
    </GridListItem>
    <GridListItem textValue="Roofs">
      <img
        src="https://images.unsplash.com/photo-1721598359121-363311b3b263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc0fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D"
        alt="Roofs"
        width={600}
        height={900}
      />
      <Text>Roofs</Text>
      <Text slot="description">JPEG • 4/24/2025</Text>
    </GridListItem>
    <GridListItem textValue="Half Dome Deer">
      <img
        src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Half Dome Deer"
        width={600}
        height={990}
      />
      <Text>Half Dome Deer</Text>
      <Text slot="description">DNG • 8/28/2018</Text>
    </GridListItem>
  </GridList>
);

Example.args = {
  onAction: undefined,
  selectionMode: "multiple",
  layout: "grid",
};

export const Sections: Story = (args) => (
  <GridList
    {...args}
    style={{ width: 800, maxWidth: "calc(100vw - 80px)" }}
    aria-label="Photos"
  >
    <GridListSection>
      <GridListHeader>Nature</GridListHeader>
      <GridListItem textValue="Desert Sunset">
        <img
          src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Desert Sunset"
          width={600}
          height={400}
        />
        <Text>Desert Sunset</Text>
        <Text slot="description">PNG • 2/3/2024</Text>
      </GridListItem>
      <GridListItem textValue="Hiking Trail">
        <img
          src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Hiking Trail"
          width={600}
          height={900}
        />
        <Text>Hiking Trail</Text>
        <Text slot="description">JPEG • 1/10/2022</Text>
      </GridListItem>
    </GridListSection>
    <GridListSection>
      <GridListHeader>Animals</GridListHeader>
      <GridListItem textValue="Lion">
        <img
          src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Lion"
          width={600}
          height={899}
        />
        <Text>Lion</Text>
        <Text slot="description">JPEG • 8/28/2021</Text>
      </GridListItem>
      <GridListItem textValue="Giraffe tongue">
        <img
          src="https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Giraffe tongue"
          width={600}
          height={900}
        />
        <Text>Giraffe tongue</Text>
        <Text slot="description">PNG • 11/27/2019</Text>
      </GridListItem>
    </GridListSection>
  </GridList>
);

Sections.args = {
  onAction: undefined,
  selectionMode: "multiple",
  layout: "grid",
};

Sections.parameters = {
  docs: {
    description: {
      story:
        "A GridList grouped into labeled sections using GridListSection and GridListHeader, with multiple selection enabled.",
    },
  },
};
