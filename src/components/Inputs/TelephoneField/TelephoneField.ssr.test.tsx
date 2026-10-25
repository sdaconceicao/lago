// @vitest-environment node
import { renderToString } from "react-dom/server";
import { TelephoneField } from "./TelephoneField";

describe("TelephoneField server rendering", () => {
  it("renders the field and full submitted value without a DOM", () => {
    expect(typeof document).toBe("undefined");

    const markup = renderToString(
      <TelephoneField
        label="Telephone"
        name="phone"
        country="US"
        defaultValue="+12125550123"
      />
    );

    expect(markup).toContain("Telephone");
    expect(markup).toContain('type="tel"');
    expect(markup).toContain('value="(212) 555-0123"');
    expect(markup).toContain('type="hidden"');
    expect(markup).toContain('name="phone"');
    expect(markup).toContain('value="+1 (212) 555-0123"');
  });
});
