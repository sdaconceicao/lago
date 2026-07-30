import type { Meta, StoryObj } from "@storybook/react";
import type { ReactEventHandler, ReactNode } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";

/**
 * An inline SVG, so the stories render the loaded path without reaching for the
 * network — which would make them flaky in the test runner.
 */
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c7d2fe"/>
        <stop offset="1" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#sky)"/>
    <circle cx="252" cy="46" r="22" fill="#fef3c7"/>
    <path d="M0 140 L84 78 L150 132 L214 92 L320 152 L320 180 L0 180 Z" fill="#3730a3"/>
    <path d="M0 158 L70 118 L142 156 L206 126 L320 172 L320 180 L0 180 Z" fill="#1e1b4b"/>
  </svg>`
)}`;

/** A URL that cannot resolve, to show what a failed load looks like. */
const BROKEN_PHOTO = "/no-such-photo.jpg";

const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
    {children}
  </div>
);

const Stack = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    {children}
  </div>
);

const Caption = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
    {children}
  </div>
);

const Label = ({ children }: { children: ReactNode }) => (
  <span style={{ font: "var(--font-size-sm) var(--font-family)" }}>
    {children}
  </span>
);

/**
 * Stands in for `next/image` in the `as` story: a component that takes props on
 * top of the standard image attributes, and forwards the rest to an `<img>`.
 * Nothing here imports Next — that is the point of the prop.
 */
type NextImageLikeProps = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  onError?: ReactEventHandler<HTMLImageElement>;
};

const NextImageLike = ({
  priority,
  quality,
  alt,
  ...props
}: NextImageLikeProps) => (
  <img {...props} alt={alt} data-priority={String(Boolean(priority))} />
);

const meta: Meta<typeof ImagePlaceholder> = {
  component: ImagePlaceholder,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An image that owns its space from the first paint, so a page does not reflow around a picture that turns up late. Give it a `width` and `height`, or an `aspectRatio`, and the box is reserved immediately: it shimmers while the image loads, fades the picture in once it decodes, and shows a 400 error in the same box if the source cannot be loaded. Every image and accessibility attribute is forwarded to the image itself, and `as` swaps the plain `<img>` for a framework component such as `next/image` without this library depending on one.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImagePlaceholder>;

export const Default: Story = {
  args: {
    src: PHOTO,
    alt: "A ridge line at dusk",
    width: 320,
    height: 180,
  },
};

export const States: Story = {
  render: () => (
    <Row>
      <Caption>
        <ImagePlaceholder alt="" isLoading width={200} height={120} />
        <Label>Loading</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder
          src={PHOTO}
          alt="A ridge line at dusk"
          width={200}
          height={120}
        />
        <Label>Loaded</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder
          src={BROKEN_PHOTO}
          alt="A ridge line at dusk"
          width={200}
          height={120}
        />
        <Label>Error</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder alt="" width={200} height={120} />
        <Label>Empty</Label>
      </Caption>
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The four states a placeholder passes through, all in a box of the same reserved size. While an image loads, a shimmer runs across the space it will occupy. Once it decodes, the picture fades in and the shimmer is removed rather than left underneath. A source that cannot be loaded is replaced by the error state in the same box, so the layout the page already reserved is kept instead of collapsing. With no `src` at all the box rests quietly — it holds the space without animating, because nothing is on its way; pass `isLoading` to shimmer anyway while the record that will supply the URL is still being fetched.",
      },
    },
  },
};

export const Placeholders: Story = {
  render: () => (
    <Stack>
      <Row>
        <Caption>
          <ImagePlaceholder alt="" isLoading width={200} height={120} />
          <Label>surface — loading</Label>
        </Caption>
        <Caption>
          <ImagePlaceholder
            alt=""
            isLoading
            placeholder="image"
            width={200}
            height={120}
          />
          <Label>image — loading</Label>
        </Caption>
        <Caption>
          <ImagePlaceholder alt="" width={200} height={120} />
          <Label>surface — empty</Label>
        </Caption>
        <Caption>
          <ImagePlaceholder
            alt=""
            placeholder="image"
            width={200}
            height={120}
          />
          <Label>image — empty</Label>
        </Caption>
      </Row>
      <Row>
        <ImagePlaceholder alt="" placeholder="image" width={64} height={64} />
        <ImagePlaceholder alt="" placeholder="image" width={120} height={80} />
        <ImagePlaceholder alt="" placeholder="image" width={280} height={160} />
      </Row>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`placeholder` picks what fills the reserved space before the image lands. `surface` is the default — a plain tinted panel, and the quieter choice for a grid of many boxes where a mark in every cell would only add noise. `image` centres a framed-landscape mark in the same panel, which says a picture is what is missing rather than leaving an unexplained grey rectangle; it earns its place in a single large slot such as a hero or an upload target. Both shimmer while an image is actually loading and both rest still when there is nothing on the way, so the choice is one of tone, not behaviour. The mark scales to the shorter edge of whatever box it is given, staying square from a 64px thumbnail up, and it takes its colour from `--image-placeholder-glyph-color` — neither it nor the panel is announced, since both sit over space that is already held.",
      },
    },
  },
};

export const ReservedSpace: Story = {
  render: () => (
    <Stack>
      <Row>
        <Caption>
          <ImagePlaceholder alt="" isLoading width={160} height={160} />
          <Label>width + height</Label>
        </Caption>
        <Caption>
          <ImagePlaceholder alt="" isLoading width={220} aspectRatio={16 / 9} />
          <Label>width + aspectRatio</Label>
        </Caption>
        <Caption>
          <ImagePlaceholder alt="" isLoading width={64} height={64} />
          <Label>thumbnail</Label>
        </Caption>
      </Row>
      <div
        style={{
          display: "grid",
          gap: 6,
          justifyItems: "start",
          width: 420,
          resize: "horizontal",
          overflow: "auto",
        }}
      >
        <ImagePlaceholder
          src={PHOTO}
          alt="A ridge line at dusk"
          width="100%"
          aspectRatio={16 / 9}
        />
        <Label>width: 100% + aspectRatio — drag the corner to resize</Label>
      </div>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The space is reserved from `width` and `height` — numbers are pixels, strings are any CSS length — or from `aspectRatio`, which is the one to reach for in a fluid column: pair it with `width: "100%"` and the box keeps its proportions at every size, so the page never jumps as images arrive. Give it at least one dimension; with none, the box has nothing to hold open and collapses to nothing until the image lands, which is the reflow the component exists to prevent.',
      },
    },
  },
};

export const ErrorStates: Story = {
  render: () => (
    <Row>
      <Caption>
        <ImagePlaceholder
          src={BROKEN_PHOTO}
          alt="A bell"
          width={200}
          height={120}
        />
        <Label>Default</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder
          src={BROKEN_PHOTO}
          alt="A bell"
          errorCode="404"
          errorMessage="No such photo"
          width={200}
          height={120}
        />
        <Label>Custom code and message</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder
          src={BROKEN_PHOTO}
          alt="A bell"
          width={96}
          height={96}
        />
        <Label>Small</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder
          src={BROKEN_PHOTO}
          alt="A bell"
          width={48}
          height={48}
        />
        <Label>Thumbnail</Label>
      </Caption>
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A failed load is reported in place as a 400, rather than leaving a blank hole or a broken-image glyph. `errorCode` and `errorMessage` replace the wording — use them where the real status is known, or pass `null` to drop either one. The error trims itself to the space it has: the message goes first, then the code, so a thumbnail keeps just the icon and never spills out of the box it was given. It is announced as "<alt text>, failed to load" so a screen reader hears which image is missing; a decorative image — one with `alt=""` — stays silent unless `errorLabel` says the failure is worth reporting.',
      },
    },
  },
};

export const AsComponent: Story = {
  render: () => (
    <Row>
      <Caption>
        <ImagePlaceholder
          src={PHOTO}
          alt="A ridge line at dusk"
          width={200}
          height={120}
        />
        <Label>Default &lt;img&gt;</Label>
      </Caption>
      <Caption>
        <ImagePlaceholder
          as={NextImageLike}
          src={PHOTO}
          alt="A ridge line at dusk"
          width={200}
          height={120}
          priority
          quality={90}
        />
        <Label>as={"{NextImage}"}</Label>
      </Caption>
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`as` swaps the plain `<img>` for any component that renders an image from `src`, `alt`, `className`, `onLoad` and `onError` — `next/image`, `gatsby-image`, or one of your own. The component's own props are type-checked once it is passed, so `next/image`'s `priority` and `quality` are accepted here without Lago depending on Next. Loading and error tracking work the same way through it, since both are driven by the events the wrapped image raises. The `loading` and `decoding` attributes are only applied to a plain `<img>` — a component that wraps one owns its own loading strategy and may not accept them.",
      },
    },
  },
};
