import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Subscribe from "./Subscribe";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("./SubscribeForm", () => ({
  default: () => <div>Mock SubscribeForm</div>,
}));

describe("Subscribe", () => {
  it("opens the modal when Subscribe button is clicked", async () => {
    const user = userEvent.setup();

    render(<Subscribe />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByText("footer.about.subscribe"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("subscribe.title")).toBeInTheDocument();
    expect(screen.getByText("Mock SubscribeForm")).toBeInTheDocument();
  });

  it("closes the modal when close button is clicked", async () => {
    const user = userEvent.setup();

    render(<Subscribe />);

    await user.click(screen.getByText("footer.about.subscribe"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "subscribe.close",
      })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
