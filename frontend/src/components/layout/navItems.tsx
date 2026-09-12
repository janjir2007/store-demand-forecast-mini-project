import type { ReactNode } from "react";
import { IconDashboard, IconForecast, IconHistory, IconProducts } from "../ui/Icons";

export interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    description: "Бизнесийн ерөнхий тойм",
    icon: <IconDashboard className="navlink__icon" />,
  },
  {
    to: "/sales",
    label: "Sales History",
    description: "Борлуулалтын түүх ба хандлага",
    icon: <IconHistory className="navlink__icon" />,
  },
  {
    to: "/forecast",
    label: "Forecast",
    description: "Ирэх сарын эрэлтийн таамаг",
    icon: <IconForecast className="navlink__icon" />,
  },
  {
    to: "/products",
    label: "Products",
    description: "Бүтээгдэхүүний жагсаалт",
    icon: <IconProducts className="navlink__icon" />,
  },
];
