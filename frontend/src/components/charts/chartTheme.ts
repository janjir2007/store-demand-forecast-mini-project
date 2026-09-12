/** Fixed categorical order — slots are assigned, never cycled. */
export const SERIES = ["#a0561f", "#0079a3", "#b5860f", "#9c4a72", "#3d8c4a"] as const;

export const CHART = {
  grid: "#eeebe7",
  axis: "#8a827a",
  surface: "#ffffff",
  /** Recharts wants literal values for axis text. */
  tick: { fill: "#8a827a", fontSize: 11, fontFamily: "Montserrat, sans-serif" },
  margin: { top: 8, right: 12, bottom: 0, left: -8 },
} as const;
