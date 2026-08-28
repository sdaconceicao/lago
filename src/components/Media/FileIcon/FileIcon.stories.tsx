import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { FileIcon } from "./FileIcon";

const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    {children}
  </div>
);

const meta: Meta<typeof FileIcon> = {
  component: FileIcon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A document glyph with a small extension badge overlaid on it. Pass a `fileName` to derive the badge — `invoice.pdf` shows `PDF` — or a name with no extension to render the glyph alone. Sizes are 32px (`sm`), 40px (`md`, matching the FileUploader list thumbnail), and 48px (`lg`).",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileIcon>;

export const Default: Story = {
  args: {
    fileName: "invoice.pdf",
    size: "md",
  },
};

export const Sizes: Story = {
  render: () => (
    <Row>
      <FileIcon fileName="invoice.pdf" size="sm" />
      <FileIcon fileName="invoice.pdf" size="md" />
      <FileIcon fileName="invoice.pdf" size="lg" />
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "FileIcon supports three sizes: sm (32px), md (40px, the default), and lg (48px).",
      },
    },
  },
};

export const Extensions: Story = {
  render: () => (
    <Row>
      <FileIcon fileName="requirements.pdf" />
      <FileIcon fileName="photo.jpeg" />
      <FileIcon fileName="app.ts" />
      <FileIcon fileName="archive.zip" />
      <FileIcon fileName="Makefile" />
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The badge is the file's uppercase extension, capped at four characters. Names with no extension — a Makefile, a hidden file — render the document glyph without a badge.",
      },
    },
  },
};
