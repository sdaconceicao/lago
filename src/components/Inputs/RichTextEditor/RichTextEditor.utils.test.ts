import type { ValidationResult } from "react-aria-components/TextField";
import type { RichTextEditorToolbar } from "./RichTextEditor.types";
import {
  buildEditorAttributes,
  buildValidation,
  DEFAULT_TOOLBAR,
  joinIds,
  normalizeToolbar,
} from "./RichTextEditor.utils";
import { TOOL_REGISTRY } from "./Toolbar/toolRegistry";

describe("DEFAULT_TOOLBAR", () => {
  it("contains no empty groups", () => {
    expect(DEFAULT_TOOLBAR.every((group) => group.length > 0)).toBe(true);
  });

  it("names only tools the registry defines", () => {
    for (const tool of DEFAULT_TOOLBAR.flat()) {
      expect(TOOL_REGISTRY[tool]).toBeDefined();
    }
  });

  it("never repeats a tool", () => {
    const tools = DEFAULT_TOOLBAR.flat();
    expect(new Set(tools).size).toBe(tools.length);
  });

  it("covers the common formatting marks", () => {
    const tools = DEFAULT_TOOLBAR.flat();
    expect(tools).toEqual(
      expect.arrayContaining([
        "bold",
        "italic",
        "underline",
        "strike",
        "link",
        "bulletList",
        "orderedList",
        "blockquote",
        "codeBlock",
        "undo",
        "redo",
      ])
    );
  });
});

describe("normalizeToolbar", () => {
  it("drops empty groups", () => {
    const toolbar: RichTextEditorToolbar = [["bold"], [], ["italic"]];

    expect(normalizeToolbar(toolbar)).toEqual([["bold"], ["italic"]]);
  });

  it("preserves group order and contents", () => {
    const toolbar: RichTextEditorToolbar = [
      ["italic", "bold"],
      ["undo", "redo"],
    ];

    expect(normalizeToolbar(toolbar)).toEqual(toolbar);
  });

  it("returns an empty array when every group is empty", () => {
    expect(normalizeToolbar([[], []])).toEqual([]);
  });

  it("handles an empty toolbar", () => {
    expect(normalizeToolbar([])).toEqual([]);
  });

  it("does not mutate the toolbar it is given", () => {
    const toolbar: RichTextEditorToolbar = [["bold"], []];

    normalizeToolbar(toolbar);

    expect(toolbar).toEqual([["bold"], []]);
  });
});

describe("joinIds", () => {
  it("joins the ids that are present", () => {
    expect(joinIds("a", "b")).toBe("a b");
  });

  it("skips false and undefined", () => {
    expect(joinIds("a", false, undefined, "b")).toBe("a b");
  });

  it("returns undefined when nothing is present", () => {
    expect(joinIds(false, undefined)).toBeUndefined();
  });

  it("returns undefined when called with nothing", () => {
    expect(joinIds()).toBeUndefined();
  });

  it("returns a single id unchanged", () => {
    expect(joinIds("only")).toBe("only");
  });
});

describe("buildEditorAttributes", () => {
  it("always names the element a multiline textbox", () => {
    expect(buildEditorAttributes({ className: "content" })).toEqual({
      class: "content",
      role: "textbox",
      "aria-multiline": "true",
    });
  });

  it("wires the label and description when they are rendered", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      labelId: "label-id",
      describedBy: "description-id error-id",
    });

    expect(attributes["aria-labelledby"]).toBe("label-id");
    expect(attributes["aria-describedby"]).toBe("description-id error-id");
  });

  it("reports the validation and required states", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      isInvalid: true,
      isRequired: true,
      isReadOnly: true,
    });

    expect(attributes["aria-invalid"]).toBe("true");
    expect(attributes["aria-required"]).toBe("true");
    expect(attributes["aria-readonly"]).toBe("true");
  });

  it("omits the state attributes when the states are false", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      isInvalid: false,
      isRequired: false,
      isReadOnly: false,
    });

    expect(attributes).not.toHaveProperty("aria-invalid");
    expect(attributes).not.toHaveProperty("aria-required");
    expect(attributes).not.toHaveProperty("aria-readonly");
  });

  it("omits the label wiring when there is no label", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      labelId: undefined,
      describedBy: undefined,
    });

    expect(attributes).not.toHaveProperty("aria-labelledby");
    expect(attributes).not.toHaveProperty("aria-describedby");
  });

  it("is deterministic for the same options", () => {
    const options = { className: "content", labelId: "label-id" };

    expect(buildEditorAttributes(options)).toEqual(
      buildEditorAttributes(options)
    );
  });
});

describe("buildValidation", () => {
  it("reports valid when the field is not invalid", () => {
    const validation = buildValidation(undefined, "Too long");

    expect(validation.isInvalid).toBe(false);
    expect(validation.validationErrors).toEqual([]);
    expect(validation.validationDetails.valid).toBe(true);
    expect(validation.validationDetails.customError).toBe(false);
  });

  it("reports valid when isInvalid is explicitly false", () => {
    expect(buildValidation(false, "Too long").isInvalid).toBe(false);
  });

  it("carries a string error message through as the default children", () => {
    const validation = buildValidation(true, "Too long");

    expect(validation.isInvalid).toBe(true);
    expect(validation.validationErrors).toEqual(["Too long"]);
    expect(validation.validationDetails.customError).toBe(true);
    expect(validation.validationDetails.valid).toBe(false);
  });

  it("leaves the errors empty for a function error message, which FieldError resolves itself", () => {
    const errorMessage = (validation: ValidationResult) =>
      validation.isInvalid ? "Invalid" : "";

    expect(buildValidation(true, errorMessage).validationErrors).toEqual([]);
  });

  it("is invalid with no message when none is given", () => {
    const validation = buildValidation(true, undefined);

    expect(validation.isInvalid).toBe(true);
    expect(validation.validationErrors).toEqual([]);
  });
});

describe("TOOL_REGISTRY", () => {
  it("gives every tool a label and an icon", () => {
    for (const [tool, definition] of Object.entries(TOOL_REGISTRY)) {
      expect(definition.label, tool).toBeTruthy();
      expect(definition.icon, tool).toBeDefined();
    }
  });

  it("gives every tool a unique label, since the label is its accessible name", () => {
    const labels = Object.values(TOOL_REGISTRY).map(({ label }) => label);

    expect(new Set(labels).size).toBe(labels.length);
  });
});
