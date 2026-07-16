import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "@/components/Inputs/Radio/RadioGroup/RadioGroup";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("renders a radio with an accessible label", () => {
    render(
      <RadioGroup label="Favorite sport">
        <Radio value="soccer">Soccer</Radio>
      </RadioGroup>
    );

    expect(screen.getByRole("radio", { name: "Soccer" })).toBeInTheDocument();
  });

  it("renders its own description", () => {
    render(
      <RadioGroup label="Plan">
        <Radio value="pro" description="Best for teams">
          Pro
        </Radio>
      </RadioGroup>
    );

    expect(screen.getByText("Best for teams")).toBeInTheDocument();
  });

  it("selects on click", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Favorite sport">
        <Radio value="soccer">Soccer</Radio>
        <Radio value="baseball">Baseball</Radio>
      </RadioGroup>
    );

    await user.click(screen.getByRole("radio", { name: "Baseball" }));

    expect(screen.getByRole("radio", { name: "Baseball" })).toBeChecked();
  });

  it("disables an individual option when isDisabled", () => {
    render(
      <RadioGroup label="Favorite sport">
        <Radio value="soccer">Soccer</Radio>
        <Radio value="baseball" isDisabled>
          Baseball
        </Radio>
      </RadioGroup>
    );

    expect(screen.getByRole("radio", { name: "Baseball" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Soccer" })).toBeEnabled();
  });
});
