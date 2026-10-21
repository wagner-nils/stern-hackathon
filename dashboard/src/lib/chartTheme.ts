// Recharts takes styles as props, so the dark tooltip lives here instead of in styles.css.
export const tooltipProps = {
  contentStyle: {
    background: "#0a1638",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    borderRadius: 4,
    color: "#f5f7fb",
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
  },
  itemStyle: { color: "#f5f7fb" },
  labelStyle: { color: "#9aa4bd" },
  cursor: { fill: "rgba(255, 255, 255, 0.04)" },
  separator: "",
};

export const animation = { isAnimationActive: true, animationDuration: 700, animationEasing: "ease-out" } as const;
