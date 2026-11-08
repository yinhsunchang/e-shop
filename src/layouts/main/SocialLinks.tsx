const SocialLinks = () => {
  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/docteur.2022/",
      icon: "fa-instagram",
    },
    {
      name: "Facebook",
      url: "",
      icon: "fa-facebook-official",
    },
    {
      name: "Pinterest",
      url: "",
      icon: "fa-pinterest-p",
    },
    {
      name: "Twitter",
      url: "",
      icon: "fa-twitter",
    },
    {
      name: "Snapchat",
      url: "",
      icon: "fa-snapchat",
    },
  ];

  return (
    <>
      <nav
        aria-label="Social media"
        className="right text-gray hide-small hide-medium"
        style={{
          zIndex: 999,
          position: "fixed",
          top: "50%",
          right: "20px",
          transform: "translate(0%, -50%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            // target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
          >
            <i
              className={`fa ${social.icon} hover-opacity`}
              aria-hidden="true"
            />
          </a>
        ))}
      </nav>
    </>
  );
};

export default SocialLinks;
