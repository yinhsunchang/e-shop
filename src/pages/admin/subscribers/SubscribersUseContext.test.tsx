import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSubscribers } from "./useSubscribers";
import type { SubscriberProps } from "@/types/subscribe";
import Subscribers from "./Subscribers";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("./useSubscribers", () => ({
  useSubscribers: vi.fn(),
}));

const mockSubscribers: SubscriberProps[] = [
  {
    id: 1,
    name: "Mimi",
    email: "mimi@example.com",
    created_at: "2026-08-20T11:00:00Z",
  },
  {
    id: 2,
    name: "John",
    email: "john@example.com",
    created_at: "2026-08-20T12:00:00Z",
  },
];

const mockDeleteSubscriber = vi.fn();

function mockUseSubscribers(subscribers: SubscriberProps[] = mockSubscribers) {
  vi.mocked(useSubscribers).mockReturnValue({
    subscribers,
    deleteSubscriber: mockDeleteSubscriber,
  });
}

describe("Subscribers", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDeleteSubscriber.mockResolvedValue(undefined);

    mockUseSubscribers();
  });

  // --------------------------------------------------
  // Rendering
  // --------------------------------------------------

  describe("Rendering", () => {
    it("should render the page title", () => {
      render(<Subscribers />);

      expect(
        screen.getByRole("heading", {
          name: "subscribers.title",
        })
      ).toBeInTheDocument();
    });

    it("should render subscribers", () => {
      render(<Subscribers />);

      expect(screen.getByText("subscribers.nameMimi")).toBeInTheDocument();

      expect(screen.getByText("subscribers.nameJohn")).toBeInTheDocument();

      expect(screen.getByText("mimi@example.com")).toBeInTheDocument();

      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("should render formatted dates", () => {
      render(<Subscribers />);

      expect(
        screen.getByText(
          new Date("2026-08-20T11:00:00Z").toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        )
      ).toBeInTheDocument();
    });

    it("should render empty message when there are no subscribers", () => {
      mockUseSubscribers([]);

      render(<Subscribers />);

      expect(screen.getByText("subscribers.empty")).toBeInTheDocument();

      expect(screen.queryByText("mimi@example.com")).not.toBeInTheDocument();
    });

    it("should render delete buttons for each subscriber", () => {
      render(<Subscribers />);

      expect(
        screen.getAllByRole("button", {
          name: "subscribers.delete",
        })
      ).toHaveLength(2);
    });
  });

  // --------------------------------------------------
  // Delete subscriber
  // --------------------------------------------------

  describe("Delete subscriber", () => {
    it("should delete a subscriber when delete button is clicked", async () => {
      const user = userEvent.setup();

      render(<Subscribers />);

      await user.click(
        screen.getAllByRole("button", {
          name: "subscribers.delete",
        })[0]
      );

      expect(mockDeleteSubscriber).toHaveBeenCalledWith(1);
      expect(mockDeleteSubscriber).toHaveBeenCalledTimes(1);
    });

    it("should show deleting text while deleting", async () => {
      const user = userEvent.setup();

      let resolveDelete!: () => void;

      mockDeleteSubscriber.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
      );

      render(<Subscribers />);

      await user.click(
        screen.getAllByRole("button", {
          name: "subscribers.delete",
        })[0]
      );

      expect(
        screen.getByRole("button", {
          name: "subscribers.deleting",
        })
      ).toBeDisabled();

      resolveDelete();

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", {
            name: "subscribers.delete",
          })
        ).toHaveLength(2);
      });
    });

    it("should not disable other subscriber buttons while deleting", async () => {
      const user = userEvent.setup();

      let resolveDelete!: () => void;

      mockDeleteSubscriber.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
      );

      render(<Subscribers />);

      const buttons = screen.getAllByRole("button", {
        name: "subscribers.delete",
      });

      await user.click(buttons[0]);

      expect(
        screen.getByRole("button", {
          name: "subscribers.deleting",
        })
      ).toBeDisabled();

      expect(
        screen.getByRole("button", {
          name: "subscribers.delete",
        })
      ).toBeEnabled();

      resolveDelete();

      await waitFor(() => {
        expect(
          screen.getAllByRole("button", {
            name: "subscribers.delete",
          })
        ).toHaveLength(2);
      });
    });
  });

  // --------------------------------------------------
  // Error handling
  // --------------------------------------------------

  describe("Error handling", () => {
    it("should show error message when deleting fails", async () => {
      const user = userEvent.setup();

      const error = new Error("Failed to delete subscriber");

      mockDeleteSubscriber.mockRejectedValueOnce(error);

      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<Subscribers />);

      await user.click(
        screen.getAllByRole("button", {
          name: "subscribers.delete",
        })[0]
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "subscribers.deleteFailed"
      );

      expect(consoleError).toHaveBeenCalledWith(error);

      expect(alertMock).toHaveBeenCalledWith("Delete failed");

      consoleError.mockRestore();
      alertMock.mockRestore();
    });

    it("should clear previous error when deleting again", async () => {
      const user = userEvent.setup();

      mockDeleteSubscriber
        .mockRejectedValueOnce(new Error("Delete failed"))
        .mockResolvedValueOnce(undefined);

      vi.spyOn(console, "error").mockImplementation(() => {});

      vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<Subscribers />);

      const buttons = screen.getAllByRole("button", {
        name: "subscribers.delete",
      });

      await user.click(buttons[0]);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "subscribers.deleteFailed"
      );

      await user.click(
        screen.getAllByRole("button", {
          name: "subscribers.delete",
        })[0]
      );

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });
});
