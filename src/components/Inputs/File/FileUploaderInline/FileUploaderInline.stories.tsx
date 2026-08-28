import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { TextField } from "@/components/Inputs/TextField/TextField";
import type { FileUploadItem } from "../FileUploader/FileUploader";
import { FileUploaderInline } from "./FileUploaderInline";

const meta: Meta<typeof FileUploaderInline> = {
  component: FileUploaderInline,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A single-line file field at TextField height. Selected files render as chips inside the field so the control lines up with other inputs in a form row. Use FileUploader for a dashed drop area or circular image target.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    onRemove: fn(),
    onReject: fn(),
    onRetry: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof FileUploaderInline>;

export const Default: Story = (args) => (
  <div style={{ width: 320 }}>
    <FileUploaderInline {...args} />
  </div>
);

Default.args = {
  label: "Attachment",
};

const preview: FileUploadItem = {
  id: "doc",
  file: new File(["a"], "requirements.pdf", { type: "application/pdf" }),
};

export const WithFile: Story = (args) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "0.75rem",
      width: 640,
    }}
  >
    <div style={{ flex: 1 }}>
      <TextField label="Title" placeholder="Report name" size={args.size} />
    </div>
    <div style={{ flex: 1 }}>
      <FileUploaderInline {...args} />
    </div>
  </div>
);

WithFile.args = {
  label: "Attachment",
  defaultValue: [preview],
};

WithFile.parameters = {
  docs: {
    description: {
      story:
        "A selected file renders as a chip inside the field, with a trailing remove button. The control stays at TextField height so it lines up in a form row.",
    },
  },
};

export const WithUploadProgress: Story = () => {
  const [failed, setFailed] = useState<FileUploadItem[]>([
    {
      id: "failed",
      file: new File(["c"], "notes.pdf", { type: "application/pdf" }),
      status: "error",
      errorMessage: "Upload failed, please try again",
    },
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: 320,
      }}
    >
      <FileUploaderInline
        label="Uploading"
        value={[
          {
            id: "uploading",
            file: new File(["a"], "requirements.pdf", {
              type: "application/pdf",
            }),
            status: "uploading",
            progress: 50,
          },
        ]}
      />
      <FileUploaderInline
        label="Complete"
        defaultValue={[
          {
            id: "complete",
            file: new File(["b"], "brief.pdf", {
              type: "application/pdf",
            }),
            status: "complete",
            progress: 100,
          },
        ]}
      />
      <FileUploaderInline
        label="Failed"
        value={failed}
        onChange={setFailed}
        onRetry={(item) => {
          setFailed((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "uploading", progress: 0 }
                : entry
            )
          );
        }}
      />
    </div>
  );
};

WithUploadProgress.parameters = {
  docs: {
    description: {
      story:
        "Upload lifecycle is supplied by the caller on each FileUploadItem, the same as FileUploader. Inline keeps the field at TextField height: uploading and complete show a 2px bar along the bottom of the chip, and a failed file keeps a retry control inside the field.",
    },
  },
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    {(["sm", "md", "lg"] as const).map((size) => (
      <div
        key={size}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.75rem",
          width: 640,
        }}
      >
        <div style={{ flex: 1 }}>
          <TextField
            label={`Title (${size})`}
            placeholder="Report name"
            size={size}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FileUploaderInline
            {...args}
            size={size}
            label={`Attachment (${size})`}
            defaultValue={[preview]}
          />
        </div>
      </div>
    ))}
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        "FileUploaderInline uses the shared field heights: sm is 28px, md (default) is 36px, and lg is 48px. Each size matches TextField so the two can sit in the same row.",
    },
  },
};

export const States: Story = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      width: 320,
    }}
  >
    <FileUploaderInline {...args} label="Default" />
    <FileUploaderInline {...args} label="Disabled" isDisabled />
    <FileUploaderInline
      {...args}
      label="Invalid"
      isInvalid
      errorMessage="A file is required"
    />
    <FileUploaderInline {...args} label="Required" isRequired />
  </div>
);

States.parameters = {
  docs: {
    description: {
      story:
        "FileUploaderInline supports disabled, invalid, and required states using the same field chrome as other inputs: a disabled drop zone, an error message when invalid, and an asterisk on a required label.",
    },
  },
};
