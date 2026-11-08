import HeaderCollectionC from "./HeaderCollectionC.tsx";
import CollectionC from "./CollectionC.tsx";

const PageCollectionC = () => {
  return (
    <>
      <HeaderCollectionC />
      <div className="padding-large">
        <CollectionC />
      </div>
    </>
  );
};

export default PageCollectionC;
