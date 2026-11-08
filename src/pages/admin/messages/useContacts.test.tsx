import { renderHook } from "@testing-library/react";
import { useContacts } from "./useContacts";
import { ContactsContext } from "./ContactsContext";

describe("useContacts", () => {
  it("should return context when used inside provider", () => {
    const mockContext = {
      contacts: [],
      loading: false,
      deleteContact: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ContactsContext.Provider value={mockContext}>
        {children}
      </ContactsContext.Provider>
    );

    const { result } = renderHook(() => useContacts(), {
      wrapper,
    });

    expect(result.current).toBe(mockContext);
  });

  it("should throw when used outside ContactsProvider", () => {
    expect(() => {
      renderHook(() => useContacts());
    }).toThrow("useContacts must be used within ContactsProvider");
  });
});
