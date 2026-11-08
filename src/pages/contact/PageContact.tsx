import HeaderContact from "./HeaderContact.tsx";
import Contact from "./Contact.tsx";

const PageContact = () => {
  return (
    <>
      <HeaderContact />
      <div className="padding-large">
        <Contact />
      </div>
    </>
  );
};

export default PageContact;
