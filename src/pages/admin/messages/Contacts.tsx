import { ContactsProvider } from "./ContactsProvider";
import UseTodosContext from "./ContactsUseContext";

function Contacts() {
  return (
    <>
      <ContactsProvider>
        <UseTodosContext />
      </ContactsProvider>
    </>
  );
}

export default Contacts;
