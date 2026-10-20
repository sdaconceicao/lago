import { act, renderHook } from "@testing-library/react";
import type { RichTextEditorToolbar } from "../RichTextEditor.types";
import { useToolbarOverflow } from "./RichTextEditorToolbar.hooks";

describe("useToolbarOverflow", () => {
  it("waits for complete measurements before hiding sections", () => {
    const toolbar: RichTextEditorToolbar = [["bold"], ["italic"]];
    const { result, rerender } = renderHook(
      ({ groups }) => useToolbarOverflow(groups),
      { initialProps: { groups: toolbar } }
    );
    const container = document.createElement("div");
    act(() => result.current.containerRef(container));
    expect(result.current.visibleCount).toBe(2);

    const bar = document.createElement("div");
    bar.setAttribute("role", "toolbar");
    bar.style.paddingLeft = "8px";
    bar.style.paddingRight = "8px";
    bar.style.columnGap = "4px";
    bar.getBoundingClientRect = () => new DOMRect(0, 0, 216, 36);
    container.append(bar);

    const first = document.createElement("div");
    first.setAttribute("data-toolbar-section", "");
    first.getBoundingClientRect = () => new DOMRect(0, 0, 100, 36);
    bar.append(first);
    rerender({ groups: [...toolbar] });
    expect(result.current.visibleCount).toBe(2);

    const more = document.createElement("div");
    more.setAttribute("data-toolbar-more-measure", "");
    more.getBoundingClientRect = () => new DOMRect(0, 0, 36, 36);
    bar.append(more);
    rerender({ groups: [...toolbar] });
    expect(result.current.visibleCount).toBe(2);

    const second = first.cloneNode() as HTMLDivElement;
    second.getBoundingClientRect = first.getBoundingClientRect;
    bar.append(second);
    rerender({ groups: [...toolbar] });

    // 200px remain after padding: both 100px groups plus their gap cannot fit.
    expect(result.current.visibleCount).toBe(1);
  });
});
