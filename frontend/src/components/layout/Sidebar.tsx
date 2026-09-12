import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { initials } from "../../lib/format";
import { Button } from "../ui/Button";
import { IconSignOut } from "../ui/Icons";
import { NAV_ITEMS } from "./navItems";

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { username, signOut } = useAuth();

  return (
    <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Үндсэн цэс">
      <div className="sidebar__brand">
        <span className="sidebar__mark">DF</span>
        <span>
          <span className="sidebar__name">Demand Forecast</span>
          <span className="sidebar__tagline">Тавилгын дэлгүүр</span>
        </span>
      </div>

      <nav className="sidebar__nav">
        <span className="sidebar__label">Цэс</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) => `navlink ${isActive ? "is-active" : ""}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="avatar">{initials(username ?? "?")}</span>
          <span>
            <span className="sidebar__username">{username}</span>
            <br />
            <span className="sidebar__role">Нэвтэрсэн</span>
          </span>
        </div>
        <Button variant="ghost" size="sm" icon={<IconSignOut size={14} />} onClick={signOut}>
          Гарах
        </Button>
      </div>
    </aside>
  );
}
