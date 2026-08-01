import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactEventHandler } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";

const SRC = "https://example.com/bell.jpg";
const OTHER_SRC = "https://example.com/other-bell.jpg";

/**
 * Stands in for `next/image`: it takes props Next adds on top of the standard
 * image attributes, which is what `as` has to accept without this library
 * depending on Next. Typing this story at all is the point — if the generic
 * stopped inferring the component's props, `priority` would fail to compile.
 */
type MockNextImageProps = {
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

const MockNextImage = ({
  priority,
  quality,
  alt,
  ...props
}: MockNextImageProps) => (
  <img
    {...props}
    alt={alt}
    data-next-image="true"
    data-priority={String(Boolean(priority))}
    data-quality={quality}
  />
);

const surfaceOf = (container: HTMLElement) =>
  container.querySelector(".image-placeholder-surface");

const errorOf = (container: HTMLElement) =>
  container.querySelector(".image-placeholder-error");

const boxOf = (container: HTMLElement) =>
  container.querySelector(".image-placeholder") as HTMLElement;

describe("ImagePlaceholder", () => {
  describe("loading", () => {
    it("renders the image and holds the space while it loads", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).toHaveAttribute("src", SRC);
      expect(image).toHaveAttribute("data-loaded", "false");
      expect(surfaceOf(container)).toBeInTheDocument();
      expect(boxOf(container)).toHaveAttribute("data-status", "loading");
    });

    it("hides the loading surface from assistive technology", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      expect(surfaceOf(container)).toHaveAttribute("aria-hidden", "true");
    });

    it("drops the surface and reveals the image once it loads", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      fireEvent.load(screen.getByRole("img", { name: "A bell" }));

      expect(surfaceOf(container)).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "A bell" })).toHaveAttribute(
        "data-loaded",
        "true"
      );
      expect(boxOf(container)).toHaveAttribute("data-status", "loaded");
    });

    it("holds the space without a src, and does not report progress", () => {
      const { container } = render(<ImagePlaceholder alt="A bell" />);

      expect(surfaceOf(container)).toBeInTheDocument();
      expect(boxOf(container)).toHaveAttribute("data-status", "empty");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("shimmers with no src while the data behind it is still coming", () => {
      const { container } = render(<ImagePlaceholder alt="A bell" isLoading />);

      expect(boxOf(container)).toHaveAttribute("data-status", "loading");
      expect(surfaceOf(container)).toBeInTheDocument();
    });

    it("keeps shimmering over an image that has already arrived", () => {
      const { container } = render(
        <ImagePlaceholder src={SRC} alt="A bell" isLoading />
      );

      fireEvent.load(screen.getByAltText("A bell"));

      expect(boxOf(container)).toHaveAttribute("data-status", "loading");
      expect(surfaceOf(container)).toBeInTheDocument();
    });

    it("draws a plain surface by default", () => {
      const { container } = render(<ImagePlaceholder alt="A bell" isLoading />);

      expect(surfaceOf(container)).toBeEmptyDOMElement();
    });

    it("draws a picture mark when asked for one", () => {
      const { container } = render(
        <ImagePlaceholder alt="A bell" isLoading placeholder="image" />
      );

      expect(surfaceOf(container)?.querySelector("svg")).toBeInTheDocument();
    });

    it("keeps the picture mark out of the accessibility tree", () => {
      const { container } = render(
        <ImagePlaceholder alt="A bell" placeholder="image" />
      );

      expect(surfaceOf(container)).toHaveAttribute("aria-hidden", "true");
      expect(surfaceOf(container)?.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });

    it("draws the picture mark on an empty placeholder too", () => {
      const { container } = render(
        <ImagePlaceholder alt="A bell" placeholder="image" />
      );

      expect(boxOf(container)).toHaveAttribute("data-status", "empty");
      expect(surfaceOf(container)?.querySelector("svg")).toBeInTheDocument();
    });

    it("drops the picture mark once the image has loaded", () => {
      const { container } = render(
        <ImagePlaceholder src={SRC} alt="A bell" placeholder="image" />
      );

      expect(container.querySelector("svg")).toBeInTheDocument();

      fireEvent.load(screen.getByAltText("A bell"));

      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });

    it("does not forward the placeholder prop to the image", () => {
      render(<ImagePlaceholder src={SRC} alt="A bell" placeholder="image" />);

      expect(screen.getByAltText("A bell")).not.toHaveAttribute("placeholder");
    });

    it("draws a mark of the caller's own in place of the built-in one", () => {
      const { container } = render(
        <ImagePlaceholder
          alt="A bell"
          isLoading
          placeholder="image"
          placeholderContent={<span data-testid="own-mark">bell</span>}
        />
      );

      expect(
        surfaceOf(container)?.querySelector("svg")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("own-mark")).toBeInTheDocument();
    });

    it("draws the caller's own mark on a plain surface too", () => {
      const { container } = render(
        <ImagePlaceholder
          alt="A bell"
          placeholderContent={<span data-testid="own-mark">bell</span>}
        />
      );

      expect(boxOf(container)).toHaveAttribute("data-status", "empty");
      expect(screen.getByTestId("own-mark")).toBeInTheDocument();
    });

    it("keeps the caller's own mark out of the accessibility tree", () => {
      const { container } = render(
        <ImagePlaceholder
          alt="A bell"
          placeholderContent={<img src={SRC} alt="A stand-in bell" />}
        />
      );

      expect(surfaceOf(container)).toHaveAttribute("aria-hidden", "true");
      expect(
        screen.queryByRole("img", { name: "A stand-in bell" })
      ).not.toBeInTheDocument();
    });

    it("drops the caller's own mark once the image has loaded", () => {
      render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          placeholderContent={<span data-testid="own-mark">bell</span>}
        />
      );

      expect(screen.getByTestId("own-mark")).toBeInTheDocument();

      fireEvent.load(screen.getByAltText("A bell"));

      expect(screen.queryByTestId("own-mark")).not.toBeInTheDocument();
    });

    it("does not forward placeholderContent to the image", () => {
      render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          placeholderContent={<span>bell</span>}
        />
      );

      expect(screen.getByAltText("A bell")).not.toHaveAttribute(
        "placeholderContent"
      );
    });

    it("lazy-loads and decodes a plain image off the main thread", () => {
      render(<ImagePlaceholder src={SRC} alt="A bell" />);

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("decoding", "async");
    });

    it("lets the caller override the loading strategy", () => {
      render(<ImagePlaceholder src={SRC} alt="A bell" loading="eager" />);

      expect(screen.getByRole("img", { name: "A bell" })).toHaveAttribute(
        "loading",
        "eager"
      );
    });
  });

  describe("loaded", () => {
    it("leaves no wrapper behind once the image has loaded", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      fireEvent.load(screen.getByAltText("A bell"));

      expect(container.querySelector("span")).not.toBeInTheDocument();
      expect(container.firstElementChild).toBe(screen.getByAltText("A bell"));
    });

    it("hands the box's classes, dimensions and status to the image", () => {
      const { container } = render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          width={320}
          height={180}
          className="custom-box"
          imageClassName="custom-image"
          style={{ borderRadius: "8px" }}
        />
      );

      fireEvent.load(screen.getByAltText("A bell"));

      const image = screen.getByAltText("A bell");
      expect(image).toHaveClass(
        "image-placeholder",
        "image-placeholder-image",
        "custom-box",
        "custom-image"
      );
      expect(image).toHaveStyle({
        width: "320px",
        height: "180px",
        borderRadius: "8px",
      });
      expect(boxOf(container)).toBe(image);
    });

    it("puts the box back when a new src starts loading", () => {
      const { container, rerender } = render(
        <ImagePlaceholder src={SRC} alt="A bell" />
      );

      fireEvent.load(screen.getByAltText("A bell"));
      rerender(<ImagePlaceholder src={OTHER_SRC} alt="A bell" />);

      expect(surfaceOf(container)).toBeInTheDocument();
      expect(boxOf(container)).toHaveAttribute("data-status", "loading");
      expect(screen.getByAltText("A bell")).toHaveAttribute(
        "data-loaded",
        "false"
      );
    });
  });

  describe("error", () => {
    it("replaces the image with a 400 error when it fails to load", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      fireEvent.error(screen.getByAltText("A bell"));

      expect(container.querySelector("img")).not.toBeInTheDocument();
      expect(errorOf(container)).toBeInTheDocument();
      expect(screen.getByText("400")).toBeInTheDocument();
      expect(screen.getByText("Image unavailable")).toBeInTheDocument();
      expect(boxOf(container)).toHaveAttribute("data-status", "error");
    });

    it("keeps the surface out of the way of the error", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      fireEvent.error(screen.getByAltText("A bell"));

      expect(surfaceOf(container)).not.toBeInTheDocument();
    });

    it("names the error after the image that is missing", () => {
      render(<ImagePlaceholder src={SRC} alt="A bell" />);

      fireEvent.error(screen.getByAltText("A bell"));

      expect(
        screen.getByRole("img", { name: "A bell, failed to load" })
      ).toBeInTheDocument();
    });

    it("takes an explicit error label in preference to the alt text", () => {
      render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          errorLabel="Bell photo unavailable"
        />
      );

      fireEvent.error(screen.getByAltText("A bell"));

      expect(
        screen.getByRole("img", { name: "Bell photo unavailable" })
      ).toBeInTheDocument();
    });

    it("stays silent for a decorative image", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="" />);

      fireEvent.error(container.querySelector("img") as HTMLImageElement);

      expect(errorOf(container)).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("announces a decorative image when given an error label", () => {
      const { container } = render(
        <ImagePlaceholder src={SRC} alt="" errorLabel="Banner unavailable" />
      );

      fireEvent.error(container.querySelector("img") as HTMLImageElement);

      expect(
        screen.getByRole("img", { name: "Banner unavailable" })
      ).toBeInTheDocument();
    });

    it("takes a custom status code and message", () => {
      render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          errorCode="404"
          errorMessage="No such bell"
        />
      );

      fireEvent.error(screen.getByAltText("A bell"));

      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("No such bell")).toBeInTheDocument();
      expect(screen.queryByText("400")).not.toBeInTheDocument();
    });

    it("drops the code and the message when they are set to null", () => {
      render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          errorCode={null}
          errorMessage={null}
        />
      );

      fireEvent.error(screen.getByAltText("A bell"));

      expect(screen.queryByText("400")).not.toBeInTheDocument();
      expect(screen.queryByText("Image unavailable")).not.toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "A bell, failed to load" })
      ).toBeInTheDocument();
    });

    it("tries again when the src changes after a failure", () => {
      const { container, rerender } = render(
        <ImagePlaceholder src={SRC} alt="A bell" />
      );

      fireEvent.error(screen.getByAltText("A bell"));
      rerender(<ImagePlaceholder src={OTHER_SRC} alt="A bell" />);

      expect(errorOf(container)).not.toBeInTheDocument();
      expect(screen.getByAltText("A bell")).toHaveAttribute("src", OTHER_SRC);
      expect(boxOf(container)).toHaveAttribute("data-status", "loading");
    });
  });

  describe("reserved space", () => {
    it("reserves the given width and height", () => {
      const { container } = render(
        <ImagePlaceholder src={SRC} alt="A bell" width={320} height={180} />
      );

      expect(boxOf(container)).toHaveStyle({ width: "320px", height: "180px" });
    });

    it("reserves a shape from an aspect ratio", () => {
      const { container } = render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          width="100%"
          aspectRatio="16 / 9"
        />
      );

      expect(boxOf(container)).toHaveStyle({
        width: "100%",
        aspectRatio: "16 / 9",
      });
    });

    it("forwards the dimensions to the image so the browser can size it", () => {
      render(
        <ImagePlaceholder src={SRC} alt="A bell" width={320} height={180} />
      );

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).toHaveAttribute("width", "320");
      expect(image).toHaveAttribute("height", "180");
    });

    it("leaves the style attribute off when no dimension is given", () => {
      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      expect(boxOf(container)).not.toHaveAttribute("style");
    });

    it("lets an inline style override the reserved dimensions", () => {
      const { container } = render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          width={320}
          style={{ width: "100%", borderRadius: "8px" }}
        />
      );

      expect(boxOf(container)).toHaveStyle({
        width: "100%",
        borderRadius: "8px",
      });
    });
  });

  describe("attributes and styling", () => {
    it("merges class names onto the box and the image", () => {
      const { container } = render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          className="custom-box"
          imageClassName="custom-image"
        />
      );

      expect(boxOf(container)).toHaveClass("image-placeholder", "custom-box");
      expect(screen.getByRole("img", { name: "A bell" })).toHaveClass(
        "image-placeholder-image",
        "custom-image"
      );
    });

    it("forwards standard image attributes", () => {
      render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          srcSet={`${SRC} 1x, ${OTHER_SRC} 2x`}
          sizes="(max-width: 40rem) 100vw, 20rem"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          fetchPriority="high"
        />
      );

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).toHaveAttribute("srcset", `${SRC} 1x, ${OTHER_SRC} 2x`);
      expect(image).toHaveAttribute("sizes", "(max-width: 40rem) 100vw, 20rem");
      expect(image).toHaveAttribute("crossorigin", "anonymous");
      expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
      expect(image).toHaveAttribute("fetchpriority", "high");
    });

    it("forwards accessibility attributes to the image", () => {
      render(
        <>
          <p id="bell-caption">Cast in 1752</p>
          <ImagePlaceholder
            src={SRC}
            alt="A bell"
            aria-describedby="bell-caption"
            title="Liberty Bell"
            lang="en"
            data-analytics-id="hero"
          />
        </>
      );

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).toHaveAccessibleDescription("Cast in 1752");
      expect(image).toHaveAttribute("title", "Liberty Bell");
      expect(image).toHaveAttribute("lang", "en");
      expect(image).toHaveAttribute("data-analytics-id", "hero");
    });

    it("calls the caller's own load and error handlers", () => {
      const onLoad = vi.fn();
      const onError = vi.fn();
      const { rerender } = render(
        <ImagePlaceholder
          src={SRC}
          alt="A bell"
          onLoad={onLoad}
          onError={onError}
        />
      );

      fireEvent.load(screen.getByAltText("A bell"));
      expect(onLoad).toHaveBeenCalledTimes(1);

      rerender(
        <ImagePlaceholder
          src={OTHER_SRC}
          alt="A bell"
          onLoad={onLoad}
          onError={onError}
        />
      );
      fireEvent.error(screen.getByAltText("A bell"));
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe("as", () => {
    it("renders through a supplied image component", () => {
      render(
        <ImagePlaceholder
          as={MockNextImage}
          src={SRC}
          alt="A bell"
          width={320}
          height={180}
          priority
          quality={90}
        />
      );

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).toHaveAttribute("data-next-image", "true");
      expect(image).toHaveAttribute("data-priority", "true");
      expect(image).toHaveAttribute("data-quality", "90");
      expect(image).toHaveClass("image-placeholder-image");
    });

    it("leaves the loading strategy to a component that owns one", () => {
      render(<ImagePlaceholder as={MockNextImage} src={SRC} alt="A bell" />);

      const image = screen.getByRole("img", { name: "A bell" });
      expect(image).not.toHaveAttribute("loading");
      expect(image).not.toHaveAttribute("decoding");
    });

    it("tracks loading and errors through a supplied component", () => {
      const { container } = render(
        <ImagePlaceholder as={MockNextImage} src={SRC} alt="A bell" />
      );

      expect(surfaceOf(container)).toBeInTheDocument();

      fireEvent.load(screen.getByAltText("A bell"));
      expect(surfaceOf(container)).not.toBeInTheDocument();

      fireEvent.error(screen.getByAltText("A bell"));
      expect(errorOf(container)).toBeInTheDocument();
    });
  });

  describe("cached images", () => {
    it("settles a cached image that resolved before the handlers attached", () => {
      const complete = vi
        .spyOn(HTMLImageElement.prototype, "complete", "get")
        .mockReturnValue(true);
      const naturalWidth = vi
        .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
        .mockReturnValue(640);

      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      expect(surfaceOf(container)).not.toBeInTheDocument();
      expect(boxOf(container)).toHaveAttribute("data-status", "loaded");

      complete.mockRestore();
      naturalWidth.mockRestore();
    });

    it("settles a cached image that had already failed", () => {
      const complete = vi
        .spyOn(HTMLImageElement.prototype, "complete", "get")
        .mockReturnValue(true);
      const naturalWidth = vi
        .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
        .mockReturnValue(0);

      const { container } = render(<ImagePlaceholder src={SRC} alt="A bell" />);

      expect(errorOf(container)).toBeInTheDocument();
      expect(boxOf(container)).toHaveAttribute("data-status", "error");

      complete.mockRestore();
      naturalWidth.mockRestore();
    });
  });
});
