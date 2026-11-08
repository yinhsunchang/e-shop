import { useContext, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactsProvider } from "./ContactsProvider";
import { ContactsContext } from "./ContactsContext";
import { contactService } from "@/services/Contact";
import type { ContactProps } from "@/types/contact";

vi.mock("@/services/Contact", () => ({
  contactService: {
    getContacts: vi.fn(),
    deleteContact: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockContacts: ContactProps[] = [
  {
    id: 1,
    name: "John",
    email: "john@example.com",
    subject: "Hello",
    message: "Hello John",
    created_at: "2026-08-20T10:00:00Z",
  },
  {
    id: 2,
    name: "Jane",
    email: "jane@example.com",
    subject: "Question",
    message: "Hello Jane",
    created_at: "2026-08-20T11:00:00Z",
  },
];

function TestConsumer() {
  const context = useContext(ContactsContext);
  const [error, setError] = useState<string | null>(null);

  if (!context) {
    throw new Error("TestConsumer must be used within ContactsProvider");
  }

  const handleDelete = async () => {
    try {
      await context.deleteContact(1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div>
      <span data-testid="loading">
        {context.loading ? "loading" : "loaded"}
      </span>

      <span data-testid="contact-count">{context.contacts.length}</span>

      {context.contacts.map((contact) => (
        <div key={contact.id} data-testid={`contact-${contact.id}`}>
          {contact.name}
        </div>
      ))}

      <button type="button" onClick={handleDelete}>
        Delete contact 1
      </button>

      {error && <span data-testid="error">{error}</span>}
    </div>
  );
}

function renderProvider() {
  return render(
    <ContactsProvider>
      <TestConsumer />
    </ContactsProvider>
  );
}

describe("ContactsProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    vi.mocked(contactService.getContacts).mockResolvedValue(mockContacts);
    vi.mocked(contactService.deleteContact).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show loading initially", () => {
    vi.mocked(contactService.getContacts).mockReturnValue(
      new Promise(() => {})
    );

    renderProvider();

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("should fetch contacts when mounted", async () => {
    renderProvider();

    await waitFor(() => {
      expect(contactService.getContacts).toHaveBeenCalledTimes(1);
    });
  });

  it("should provide contacts after fetching", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("contact-count")).toHaveTextContent("2");
    });

    expect(screen.getByTestId("contact-1")).toHaveTextContent("John");
    expect(screen.getByTestId("contact-2")).toHaveTextContent("Jane");
  });

  it("should set loading to false after fetching", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });
  });

  it("should handle fetch error", async () => {
    const error = new Error("Fetch failed");

    vi.mocked(contactService.getContacts).mockRejectedValue(error);

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("contact-count")).toHaveTextContent("0");

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to fetch contacts:",
      error
    );
  });

  it("should delete contact after confirmation", async () => {
    const user = userEvent.setup();

    vi.mocked(window.confirm).mockReturnValue(true);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("contact-count")).toHaveTextContent("2");
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete contact 1",
      })
    );

    expect(window.confirm).toHaveBeenCalledWith("confirm.delete");

    expect(contactService.deleteContact).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByTestId("contact-count")).toHaveTextContent("1");
    });

    expect(screen.queryByTestId("contact-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("contact-2")).toBeInTheDocument();
  });

  it("should not delete contact when confirmation is cancelled", async () => {
    const user = userEvent.setup();

    vi.mocked(window.confirm).mockReturnValue(false);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("contact-count")).toHaveTextContent("2");
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete contact 1",
      })
    );

    expect(window.confirm).toHaveBeenCalledWith("confirm.delete");

    expect(contactService.deleteContact).not.toHaveBeenCalled();

    expect(screen.getByTestId("contact-count")).toHaveTextContent("2");

    expect(screen.getByTestId("contact-1")).toBeInTheDocument();
    expect(screen.getByTestId("contact-2")).toBeInTheDocument();
  });

  it("should handle delete error", async () => {
    const user = userEvent.setup();

    const error = new Error("Delete failed");

    vi.mocked(window.confirm).mockReturnValue(true);

    vi.mocked(contactService.deleteContact).mockRejectedValue(error);

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("contact-count")).toHaveTextContent("2");
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete contact 1",
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Delete failed");
    });

    expect(contactService.deleteContact).toHaveBeenCalledWith(1);

    expect(screen.getByTestId("contact-1")).toBeInTheDocument();
    expect(screen.getByTestId("contact-2")).toBeInTheDocument();

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to delete contact:",
      error
    );
  });
});
