import HeaderAbout from "./HeaderAbout.tsx";
import About from "./About.tsx";

const PageAbout = () => {
  return (
    <>
      <HeaderAbout />
      <div className="padding-large">
        <About />
      </div>
    </>
  );
};

export default PageAbout;
