import { render, screen } from "@testing-library/react";
import PromoBar from "./PromoBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "promobar.text1": "Objects selected by Doctor.",
        "promobar.text2": "Free Shipping Over €50 !",
      }[key] ?? key),
  }),
}));

test("renders first message of typing effect", async () => {
  render(<PromoBar />);
  expect(await screen.findByText("Objects")).toBeInTheDocument();
});
