import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Accordion from "./ProductAccordion";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("Accordion", () => {
  it("should render all sections collapsed initially", () => {
    render(<Accordion />);

    const buttons = screen.getAllByRole("button");

    expect(buttons).toHaveLength(3);

    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("should expand a section when clicked", async () => {
    const user = userEvent.setup();

    render(<Accordion />);

    const paymentButton = screen.getByRole("button", {
      name: /product.accordion.title1/i,
    });

    await user.click(paymentButton);

    expect(paymentButton).toHaveAttribute("aria-expanded", "true");

    expect(screen.getByText("product.accordion.text1")).toBeVisible();
  });

  it("should collapse a section when clicked again", async () => {
    const user = userEvent.setup();

    render(<Accordion />);

    const paymentButton = screen.getByRole("button", {
      name: /product.accordion.title1/i,
    });

    await user.click(paymentButton);
    await user.click(paymentButton);

    expect(paymentButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should close the previous section when another is opened", async () => {
    const user = userEvent.setup();

    render(<Accordion />);

    const paymentButton = screen.getByRole("button", {
      name: /product.accordion.title1/i,
    });

    const shippingButton = screen.getByRole("button", {
      name: /product.accordion.title2/i,
    });

    await user.click(paymentButton);

    await user.click(shippingButton);

    expect(paymentButton).toHaveAttribute("aria-expanded", "false");
    expect(shippingButton).toHaveAttribute("aria-expanded", "true");
  });
});
