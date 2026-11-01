import type { Meta, StoryObj } from "@storybook/react";
import { CARD_BRANDS } from "@/components/Inputs/CreditCardNumber/CreditCardNumber.utils";
import { CardBrandImage } from "./CardBrandImage";

const meta: Meta<typeof CardBrandImage> = {
  component: CardBrandImage,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A card brand mark loaded as an SVG image, with a stable 780 × 500 aspect ratio and a generic card icon when no brand is known or the image fails. The default URL points to the flat artwork in the `react-payment-logos` repository at a pinned commit on jsDelivr. Set `cdnUrl` to serve lowercase brand filenames from your own host or local assets; a trailing slash is optional. Images are decorative by default. Set `alt` when the mark needs its own accessible name, which is preserved if the image fails. `CreditCardNumber` uses this same component and announces its detected brand separately. Use `getCardBrandLogoUrl` for your own image renderer, or the optional `@code-x/lago/payment-logos` entry for inline SVG components.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CardBrandImage>;

export const Default: Story = {
  args: {
    brand: "visa",
    alt: "Visa",
    style: { width: 78 },
  },
};

export const Brands: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1.5rem",
      }}
    >
      {CARD_BRANDS.map(({ brand, label }) => (
        <figure key={brand} style={{ margin: 0, textAlign: "center" }}>
          <CardBrandImage brand={brand} style={{ width: 78 }} />
          <figcaption>{label}</figcaption>
        </figure>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All eight supported brands share one card canvas and keep the same dimensions. Only images for rendered brands are requested; their artwork stays outside the JavaScript bundle and can use the browser's image cache. Each mark is decorative here because its visible caption already names the brand.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      <div>
        <CardBrandImage brand="visa" style={{ width: 78 }} />
        <span>Visa ending in 4242</span>
      </div>
      <CardBrandImage
        brand="mastercard"
        alt="Mastercard"
        style={{ width: 78 }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Leave `alt` empty when nearby text names the card so assistive technology does not announce the brand twice. Give a standalone mark an `alt`, as with Mastercard here. The component keeps that accessible name on its container if an image error replaces the artwork with the generic card icon.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      <figure style={{ margin: 0, textAlign: "center" }}>
        <CardBrandImage brand="visa" style={{ width: 78 }} />
        <figcaption>Known brand</figcaption>
      </figure>
      <figure style={{ margin: 0, textAlign: "center" }}>
        <CardBrandImage brand={null} style={{ width: 78 }} />
        <figcaption>Unknown brand</figcaption>
      </figure>
      <figure style={{ margin: 0, textAlign: "center" }}>
        <CardBrandImage
          brand="visa"
          cdnUrl="/no-such-card-logos"
          style={{ width: 78 }}
        />
        <figcaption>Image unavailable</figcaption>
      </figure>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A known brand loads its image, `brand={null}` displays a generic icon without a request, and an unavailable image falls back to the same icon. The frame keeps its aspect ratio in every state. A different brand or image base URL can load after a failure.",
      },
    },
  },
};
