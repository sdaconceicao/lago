import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { FileUploader, type FileUploadItem } from "./FileUploader";

const meta: Meta<typeof FileUploader> = {
  component: FileUploader,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A file and image uploader with drag-and-drop, click-to-browse, and a list of selected files. Image files show a thumbnail preview; other files show a FileIcon with an extension badge. Upload progress and error states are supplied by the caller through each item's status.",
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

type Story = StoryFn<typeof FileUploader>;

export const Example: Story = (args) => <FileUploader {...args} />;

Example.args = {
  label: "Attachments",
  hint: "SVG, PNG, JPG or GIF (max. 800x400px)",
};

const singleFilePreview: FileUploadItem = {
  id: "contract",
  file: new File(["a"], "acme-msa.pdf", { type: "application/pdf" }),
};

export const SingleFile: Story = (args) => <FileUploader {...args} />;

SingleFile.args = {
  label: "Contract",
  allowsMultiple: false,
  hint: "PDF, DOCX, or image (max. 10 MB).",
  defaultValue: [singleFilePreview],
};

SingleFile.parameters = {
  docs: {
    description: {
      story:
        "When `allowsMultiple` is false, the selected file replaces the drop area. Click the card to replace it, or use the remove control. Multiple-file uploaders keep the empty drop zone and list files below.",
    },
  },
};

export const WithUploadProgress: Story = () => {
  const [items, setItems] = useState<FileUploadItem[]>([
    {
      id: "uploading",
      file: new File(["a"], "dashboard.jpg", { type: "image/jpeg" }),
      previewUrl: "https://picsum.photos/seed/lago-upload/80/80",
      status: "uploading",
      progress: 50,
    },
    {
      id: "complete",
      file: new File(["b"], "requirements.pdf", { type: "application/pdf" }),
      status: "complete",
      progress: 100,
    },
    {
      id: "failed",
      file: new File(["c"], "requirements-old.pdf", {
        type: "application/pdf",
      }),
      status: "error",
      errorMessage: "Upload failed, please try again",
    },
  ]);

  const [avatar, setAvatar] = useState<FileUploadItem[]>([
    {
      id: "avatar",
      file: new File(["a"], "avatar.jpg", { type: "image/jpeg" }),
      previewUrl: "https://picsum.photos/seed/lago-round/80/80",
      status: "uploading",
      progress: 50,
    },
  ]);

  const [cover, setCover] = useState<FileUploadItem[]>([
    {
      id: "cover",
      file: new File(["a"], "cover.jpg", { type: "image/jpeg" }),
      previewUrl: "https://picsum.photos/seed/lago-cover/80/80",
      status: "uploading",
      progress: 50,
    },
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "flex-start",
      }}
    >
      <FileUploader
        label="Project files"
        hint="Upload files to add to this project (max. 1 MB)."
        value={items}
        onChange={setItems}
        onRetry={(item) => {
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "uploading", progress: 0 }
                : entry
            )
          );
        }}
      />
      <FileUploader
        label="Cover image"
        allowsMultiple={false}
        hint="The file occupies the drop area."
        value={cover}
        onChange={setCover}
        onRetry={(item) => {
          setCover((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "uploading", progress: 0 }
                : entry
            )
          );
        }}
      />
      <FileUploader
        label="Profile photo"
        variant="round"
        accept="image/png,image/jpeg"
        allowsMultiple={false}
        hint="Progress stays inside the circle."
        value={avatar}
        onChange={setAvatar}
        onRetry={(item) => {
          setAvatar((current) =>
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
        "Upload lifecycle states are controlled by the caller. Set `status`, `progress`, and `errorMessage` on each `FileUploadItem`. Default rows show a bar inside the existing file card. A single-file uploader occupies the drop area with that card; the round variant overlays a ProgressCircle on the image inside the circle.",
    },
  },
};

export const AcceptImagesOnly: Story = (args) => <FileUploader {...args} />;

AcceptImagesOnly.args = {
  label: "Screenshot",
  accept: "image/png,image/jpeg",
  hint: "Please upload PNG or JPEG images only.",
};

export const Disabled: Story = (args) => <FileUploader {...args} />;

Disabled.args = {
  label: "Attachments",
  hint: "Uploads are disabled.",
  isDisabled: true,
};

const roundPreview: FileUploadItem = {
  id: "avatar",
  file: new File(["a"], "avatar.jpg", { type: "image/jpeg" }),
  previewUrl: "https://picsum.photos/seed/lago-round/80/80",
};

export const Round: Story = (args) => <FileUploader {...args} />;

Round.args = {
  label: "Profile photo",
  variant: "round",
  accept: "image/png,image/jpeg",
  allowsMultiple: false,
  hint: "PNG or JPEG only.",
  defaultValue: [roundPreview],
};

Round.parameters = {
  docs: {
    description: {
      story:
        'The `"round"` variant renders a circular drop zone. When a single image is selected, it fills the circle; click to replace or use the remove control.',
    },
  },
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <FileUploader {...args} size="sm" label="Small" />
      <FileUploader {...args} size="md" label="Medium (default)" />
      <FileUploader {...args} size="lg" label="Large" />
    </div>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      <FileUploader
        {...args}
        size="sm"
        variant="round"
        allowsMultiple={false}
        accept="image/png,image/jpeg"
        label="Small round"
        defaultValue={[roundPreview]}
      />
      <FileUploader
        {...args}
        size="md"
        variant="round"
        allowsMultiple={false}
        accept="image/png,image/jpeg"
        label="Medium round"
        defaultValue={[roundPreview]}
      />
      <FileUploader
        {...args}
        size="lg"
        variant="round"
        allowsMultiple={false}
        accept="image/png,image/jpeg"
        label="Large round"
        defaultValue={[roundPreview]}
      />
    </div>
  </div>
);

Sizes.args = {
  hint: "Drag files here or click to browse.",
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        "FileUploader supports sm, md (default), and lg. Default and round scale the drop zone (48 / 72 / 96px).",
    },
  },
};
