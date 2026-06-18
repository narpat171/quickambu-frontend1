import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import "leaflet/dist/leaflet.css";
import Role from "./components/Role.jsx";
import AmbuRegister from "./components/AmbuRegister.jsx";
import UserRegister from "./components/UserRegister.jsx";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import About from "./components/About.jsx";
import UserLogin from "./components/UserLogin.jsx";
import DriverLogin from "./components/DriverLogin.jsx";
import AmbulanceDashboard from "./components/AmbulanceDashboard.jsx";

// 👇 1. यहाँ AdminDashboard को इम्पोर्ट किया गया है 
import AdminDashboard from "./components/AdminDashboard.jsx"; 
import AdminLogin from "./components/AdminLogin.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/UserDashboard",
    element: <UserDashboard />,
  },
  {
    path: "/About",
    element: <About/>,
  },
  {
    path: "/Role",
    element: <Role/>,
  },
   {
    path: "/AmbuRegister",
    element: <AmbuRegister />,
  },
  {
    path: "/UserRegister",
    element: <UserRegister />,
  },
  {
    path: "/UserLogin",
    element: <UserLogin />,
  },
  {
    path: "/DriverLogin",
    element: <DriverLogin />,
  },
  {
    path: "/AmbulanceDashboard",
    element: <AmbulanceDashboard />
  },
  // 👇 2. यहाँ नया Admin रूट (Route) जोड़ दिया गया है
  {
    path: "/admin",
    element: <AdminDashboard />
  },
  {
   path: "/AdminLogin",
   element: <AdminLogin />
},
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);