import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Pagination, type PaginationProps } from "./Pagination";

/**
 * A controlled wrapper so the stories reflect real navigation. Seeds its local
 * page from the incoming `page` arg and keeps the control panel in sync.
 */
const ControlledPagination = ({
  page,
  onPageChange,
  ...props
}: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(page);
  return (
    <Pagination
      {...props}
      page={currentPage}
      onPageChange={(next) => {
        setCurrentPage(next);
        onPageChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  args: {
    onPageChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A navigation control for moving through a paginated set of results. Renders numbered page buttons with Previous/Next controls, collapsing large ranges with ellipses. The current page is announced via aria-current, ellipses are hidden from assistive technology, and the whole control is wrapped in a labelled navigation landmark.",
      },
    },
  },
  tags: ["autodocs"],
  render: (args) => <ControlledPagination {...args} />,
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    page: 1,
    totalPages: 10,
    siblingCount: 1,
    boundaryCount: 1,
    hidePrevNext: false,
  },
};

export const Truncation: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ControlledPagination page={1} totalPages={12} onPageChange={fn()} />
      <ControlledPagination page={6} totalPages={12} onPageChange={fn()} />
      <ControlledPagination page={12} totalPages={12} onPageChange={fn()} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When there are more pages than can be shown at once, the range is collapsed with ellipses while always keeping the first page, last page, and the pages immediately around the current page visible.",
      },
    },
  },
};

export const SmallRange: Story = {
  render: () => (
    <ControlledPagination page={2} totalPages={5} onPageChange={fn()} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When every page fits, all page numbers are shown without any ellipses.",
      },
    },
  },
};

export const Siblings: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ControlledPagination
        page={10}
        totalPages={20}
        siblingCount={0}
        onPageChange={fn()}
      />
      <ControlledPagination
        page={10}
        totalPages={20}
        siblingCount={1}
        onPageChange={fn()}
      />
      <ControlledPagination
        page={10}
        totalPages={20}
        siblingCount={2}
        onPageChange={fn()}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "siblingCount controls how many page buttons appear on each side of the current page (0, 1, and 2 shown here). boundaryCount similarly controls how many pages are pinned to the start and end.",
      },
    },
  },
};

export const WithoutPrevNext: Story = {
  render: () => (
    <ControlledPagination
      page={4}
      totalPages={10}
      hidePrevNext
      onPageChange={fn()}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Set hidePrevNext to render only the numbered page buttons, omitting the Previous and Next controls.",
      },
    },
  },
};
