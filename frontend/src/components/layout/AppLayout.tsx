import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { IconMenu } from "../ui/Icons";
import { Sidebar } from "./Sidebar";
import { NAV_ITEMS } from "./navItems";

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const active = NAV_ITEMS.find((item) => (item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)));

  // The drawer should never survive a route change on small screens.
  useEffect(() => setNavOpen(false), [location.pathname]);

  return (
    <div className="shell">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      {navOpen && <button className="scrim" aria-label="Цэс хаах" onClick={() => setNavOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <Button
            className="topbar__toggle"
            variant="ghost"
            aria-label="Цэс нээх"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
            icon={<IconMenu />}
          />
          <span className="topbar__title">{active?.label ?? "Demand Forecast"}</span>
          <span className="topbar__meta">{active?.description}</span>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
