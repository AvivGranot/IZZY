import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./components/Root";
import IZZY from "./components/IZZY";
// import AICoachPro from "./components/AICoachPro";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // {
      //   path: "aicoachpro",
      //   element: <AICoachPro />,
      // },
      {
        path: "izzy",
        element: <IZZY />,
      },
    ],
  },
]);

export default router;