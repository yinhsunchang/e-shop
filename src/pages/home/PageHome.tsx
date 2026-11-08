import PromoBar from "./PromoBar.tsx";
import Slide from "./Slide.tsx";
import Home from "./Home.tsx";

const PageHome = () => {
  return (
    <>
      <PromoBar />
      <Slide />
      <div className="padding-large">
        <Home />
      </div>
    </>
  );
};

export default PageHome;
