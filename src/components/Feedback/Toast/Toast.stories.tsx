import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/Actions/Button/Button";
import type { FeedbackVariant } from "@/components/Feedback/Feedback/Feedback.variants";
import { ToastArea, ToastQueue } from "./Toast";

const VARIANTS: FeedbackVariant[] = [
  "default",
  "info",
  "success",
  "warning",
  "error",
];

interface ToastStoryArgs {
  title: string;
  description?: string;
  variant?: FeedbackVariant;
  timeout?: number;
  buttonLabel: string;
}

const meta: Meta<ToastStoryArgs> = {
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "The title of the toast.",
    },
    description: {
      control: "text",
      description: "Optional description text.",
    },
    variant: {
      control: "select",
      options: VARIANTS,
      description:
        "The semantic tone of the toast. Takes the same tones and glyphs as Alert. Passed on the content, not as a ToastQueue option.",
    },
    timeout: {
      control: "number",
      description: "Auto-dismiss timeout in milliseconds.",
    },
    buttonLabel: {
      control: "text",
      description: "Label for the trigger button.",
    },
  },
  args: {
    title: "Files uploaded",
    description: "3 files uploaded successfully.",
    variant: "default",
    buttonLabel: "Show toast",
  },
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Example: Story = {
  render: (args) => (
    <>
      <ToastArea />
      <Button
        onPress={() =>
          ToastQueue.add(
            {
              title: args.title,
              description: args.description,
              variant: args.variant,
            },
            args.timeout ? { timeout: args.timeout } : undefined
          )
        }
      >
        {args.buttonLabel}
      </Button>
    </>
  ),
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
export const ToastQueue = new RACToastQueue<ToastContent>();

export function ToastArea() {
  return (
    <RACToastRegion queue={ToastQueue}>
      {({toast}) => (
        <Toast toast={toast}>
          <span className="toast-icon">
            {VARIANT_ICONS[toast.content.variant ?? "default"]}
          </span>
          <RACToastContent>
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description">{toast.content.description}</Text>
            )}
          </RACToastContent>
          <IconButton slot="close" aria-label="Close" variant="quiet" size="sm">
            <X size={16} />
          </IconButton>
        </Toast>
      )}
    </RACToastRegion>
  );
}

export function Toast(props: ToastProps) {
  return (
    <RACToast
      {...props}
      data-variant={props.toast.content.variant ?? "default"}
    />
  );
}

<>
  <ToastArea />
  <Button onPress={() => ToastQueue.add(
    {title: args.title, description: args.description, variant: args.variant},
    args.timeout ? {timeout: args.timeout} : undefined
  )}>
    {args.buttonLabel}
  </Button>
</>`;
        },
      },
    },
  },
};

/**
 * The five tones a toast can take, matching `Alert` glyph for glyph and hue for
 * hue — both read their colours from the same `feedbackSurface` treatment.
 *
 * `default` carries no hue: it takes the library's own surface and text tokens,
 * so it reads as white on a light page and a raised grey on a dark one. Reach
 * for one of the other four only when the toast genuinely reports a status.
 */
export const Variants: Story = {
  render: () => (
    <>
      <ToastArea />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            onPress={() =>
              ToastQueue.add({
                title: VARIANT_TITLES[variant],
                description: VARIANT_DESCRIPTIONS[variant],
                variant,
              })
            }
          >
            {variant}
          </Button>
        ))}
      </div>
    </>
  ),
};

const VARIANT_TITLES: Record<FeedbackVariant, string> = {
  default: "Scheduled maintenance",
  info: "Sync in progress",
  success: "Files uploaded",
  warning: "Storage almost full",
  error: "Upload failed",
};

const VARIANT_DESCRIPTIONS: Record<FeedbackVariant, string> = {
  default: "The service is read-only until 04:00 UTC.",
  info: "12 of 40 records copied.",
  success: "3 files uploaded successfully.",
  warning: "You have used 92% of your quota.",
  error: "The connection dropped. Nothing was saved.",
};
