import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contacts from "./ContactsUseContext";
import { useContacts } from "./useContacts";
import type { ContactProps } from "@/types/contact";

vi.mock("./useContacts", () => ({
  useContacts: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loading: "Loading...",
        "contacts.title": "Contacts",
        "contacts.name": "Name: ",
        "contacts.empty": "No contacts",
        "contacts.delete": "Delete",
        "contacts.deleting": "Deleting...",
        "messages.deleteFailed": "Failed to delete contact",
      };

      return translations[key] ?? key;
    },
  }),
}));

const mockContacts: ContactProps[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    subject: "Hello",
    message: "Hello from John",
    created_at: "2026-08-20T10:30:00Z",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Question",
    message: "Hello from Jane",
    created_at: "2026-08-20T11:30:00Z",
  },
];

const mockDeleteContact = vi.fn();

function mockUseContacts(
  overrides: Partial<ReturnType<typeof useContacts>> = {}
) {
  vi.mocked(useContacts).mockReturnValue({
    contacts: mockContacts,
    loading: false,
    deleteContact: mockDeleteContact,
    ...overrides,
  });
}

describe("Contacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDeleteContact.mockResolvedValue(undefined);

    mockUseContacts();
  });

  it("should show loading state", () => {
    mockUseContacts({
      contacts: [],
      loading: true,
    });

    render(<Contacts />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show empty message when there are no contacts", () => {
    mockUseContacts({
      contacts: [],
      loading: false,
    });

    render(<Contacts />);

    expect(screen.getByText("No contacts")).toBeInTheDocument();
  });

  it("should render all contacts", () => {
    render(<Contacts />);

    expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hello from John")).toBeInTheDocument();

    expect(screen.getByText("Name: Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Question")).toBeInTheDocument();
    expect(screen.getByText("Hello from Jane")).toBeInTheDocument();
  });

  it("should format created_at date", () => {
    render(<Contacts />);

    const date = new Date("2026-08-20T10:30:00Z");

    const expectedDate = date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("should delete a contact when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(<Contacts />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });

    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]);

    expect(mockDeleteContact).toHaveBeenCalledTimes(1);
    expect(mockDeleteContact).toHaveBeenCalledWith(1);
  });

  it("should show deleting state while deleting", async () => {
    const user = userEvent.setup();

    let resolveDelete!: () => void;

    mockDeleteContact.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      })
    );

    render(<Contacts />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });

    await user.click(deleteButtons[0]);

    const deletingButton = screen.getByRole("button", {
      name: "Deleting...",
    });

    expect(deletingButton).toBeDisabled();

    const secondDeleteButton = screen.getByRole("button", {
      name: "Delete",
    });

    expect(secondDeleteButton).not.toBeDisabled();

    resolveDelete();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });
  });

  it("should show error when delete fails", async () => {
    const user = userEvent.setup();

    const error = new Error("Delete failed");

    mockDeleteContact.mockRejectedValue(error);

    render(<Contacts />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });

    await user.click(deleteButtons[0]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to delete contact"
    );

    expect(mockDeleteContact).toHaveBeenCalledWith(1);
  });

  it("should clear previous error before deleting again", async () => {
    const user = userEvent.setup();

    mockDeleteContact
      .mockRejectedValueOnce(new Error("Delete failed"))
      .mockResolvedValueOnce(undefined);

    render(<Contacts />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });

    // First delete fails
    await user.click(deleteButtons[0]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to delete contact"
    );

    // Delete again
    const updatedDeleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });

    await user.click(updatedDeleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
