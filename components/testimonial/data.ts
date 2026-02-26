import { Tweet } from "./types";

export const tweets: Tweet[] = [
  {
    id: "0",
    content: "Damn bro Damn!",
    user: {
      name: "Manish kumar",
      username: "Manixh02",
      avatar:
        "https://pbs.twimg.com/profile_images/2006420732029579269/wO8VRM8-_400x400.jpg",
      isVerified: true,
    },
  },
  {
    id: "1",
    content: "Welcome to Ossium Inc.",
    user: {
      name: "Ossium Inc.",
      username: "ossium_inc",
      avatar:
        "https://pbs.twimg.com/profile_images/2025197371609796608/5K0TR8jH_400x400.jpg",
      isVerified: true,
      isOrg: true,
    },
  },
   {
    id: "3",
    content: "Wanna be here? Donate Pls!",
    user: {
      name: "Buy Me A Coffee",
      username: "buymeacoffee",
      avatar:
        "https://pbs.twimg.com/profile_images/1877558418489356288/CIzNmBCV_400x400.png",
      isVerified: true,
      isOrg: true,
    },
  },
];
