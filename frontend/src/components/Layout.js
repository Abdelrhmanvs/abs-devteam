import { Outlet, useLocation } from "react-router-dom";
import UpperNav from "./UpperNav";

const Layout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="App">
      {!isLandingPage && !isAuthPage && <UpperNav />}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
