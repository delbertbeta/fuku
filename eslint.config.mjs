import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      // This repo uses effects for data fetching/state hydration.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
