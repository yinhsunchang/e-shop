import { SubscribersProvider } from "./SubscribersProvider";
import SubscribersUseContext from "./SubscribersUseContext";

function Subscribers() {
  return (
    <div>
      <SubscribersProvider>
        <SubscribersUseContext />
      </SubscribersProvider>
    </div>
  );
}

export default Subscribers;
