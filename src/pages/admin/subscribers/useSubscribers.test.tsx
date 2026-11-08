import { render, screen } from "@testing-library/react";
import { useSubscribers } from "./useSubscribers";
import { SubscribersProvider } from "./SubscribersProvider";

function TestConsumer() {
  const { subscribers } = useSubscribers();

  return <p data-testid="count">{subscribers.length}</p>;
}

describe("useSubscribers", () => {
  it("should return context when used within SubscribersProvider", () => {
    render(
      <SubscribersProvider>
        <TestConsumer />
      </SubscribersProvider>
    );

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("should throw when used outside SubscribersProvider", () => {
    function InvalidComponent() {
      useSubscribers();
      return null;
    }

    expect(() => render(<InvalidComponent />)).toThrow(
      "useSubscribers must be used within SubscribersProvider"
    );
  });
});
