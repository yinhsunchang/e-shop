import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useContext } from "react";
import { SubscribersProvider } from "./SubscribersProvider";
import { SubscribersContext } from "./SubscribersContext";
import { subscriberService } from "@/services/Subscriber";
import type { SubscriberProps } from "@/types/subscribe";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/services/Subscriber", () => ({
  subscriberService: {
    getSubscribers: vi.fn(),
    deleteSubscriber: vi.fn(),
  },
}));

const mockSubscribers: SubscriberProps[] = [
  {
    id: 1,
    name: "John",
    email: "mimi@example.com",
    created_at: "2026-08-20T10:00:00Z",
  },
  {
    id: 2,
    name: "Jane",
    email: "john@example.com",
    created_at: "2026-08-20T11:00:00Z",
  },
];

function TestConsumer() {
  const context = useContext(SubscribersContext);

  if (!context) {
    throw new Error("TestConsumer must be used within SubscribersProvider");
  }

  const { subscribers, deleteSubscriber } = context;

  const handleDelete = async () => {
    try {
      await deleteSubscriber(1);
    } catch {
      // Prevent unhandled promise rejection.
    }
  };

  return (
    <div>
      <p data-testid="count">{subscribers.length}</p>

      {subscribers.map((subscriber) => (
        <p key={subscriber.id}>{subscriber.email}</p>
      ))}

      <button type="button" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}

describe("SubscribersProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(subscriberService.getSubscribers).mockResolvedValue(
      mockSubscribers
    );

    vi.mocked(subscriberService.deleteSubscriber).mockResolvedValue(undefined);

    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("should delete a subscriber", async () => {
    render(
      <SubscribersProvider>
        <TestConsumer />
      </SubscribersProvider>
    );

    await screen.findByText("mimi@example.com");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    await waitFor(() => {
      expect(subscriberService.deleteSubscriber).toHaveBeenCalledWith(1);
    });

    expect(screen.queryByText("mimi@example.com")).not.toBeInTheDocument();

    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("should not delete when confirmation is cancelled", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    render(
      <SubscribersProvider>
        <TestConsumer />
      </SubscribersProvider>
    );

    await screen.findByText("mimi@example.com");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(subscriberService.deleteSubscriber).not.toHaveBeenCalled();

    expect(screen.getByText("mimi@example.com")).toBeInTheDocument();

    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });
});
