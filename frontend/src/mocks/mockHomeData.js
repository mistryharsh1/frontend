// src/mocks/mockHomeData.js
const mockData = {
  hero: {
    title: "Welcome to Serbia",
    subtitle:
      "This web portal is an official platform administered by the Government of the Republic of Serbia. Here you can find all the information about immigration to Serbia.",
    note:
      "1 pursuant to Article 3, Paragraph 1, Point 13c of the Law on Foreigners (\"Official Gazette of RS\") ..."
  },
  steps: [
    {
      title: "Tell us your plans",
      desc: "Answer a few quick questions so that we can provide you with adequate information."
    },
    {
      title: "Check your options",
      desc: "Learn what you need to do to legalize your stay in the Republic of Serbia."
    },
    {
      title: "Submit your application",
      desc: "Prepare the documents and submit your application."
    }
  ],
  cards: [
    {
      title: "Registration upon arrival",
      excerpt:
        "Legal entities and individuals providing accommodation services to foreigners with financial compensation, as well as persons being...",
      img: "/card1.jpg",
      imgAlt: "Form filling",
      href: "#"
    },
    {
      title: "Driver's licenses for foreigners",
      excerpt:
        "A citizen of the Republic of Serbia who holds a driver's license of an EU member state or a foreigner temporarily residing in the...",
      img: "/card2.jpg",
      imgAlt: "Driver licence",
      href: "#"
    }
  ],
  entryBox: {
    title: "General Entry Requirements",
    text:
      "When entering the Republic of Serbia, it is useful to know the rules that apply to all visitors, irrespective of whether they enter with or without a visa."
  },
  band: {
    title: "eApplications",
    desc: "Apply for a visa or get your residence and work permits online.",
    services: [
      "eApplication for C visa",
      "eApplication for D visa",
      "eApplication for Temporary residence permit including single permit"
    ]
  }
};

export default mockData;
