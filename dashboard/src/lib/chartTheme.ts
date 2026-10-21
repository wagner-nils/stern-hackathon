// Recharts takes styles as props, so the tooltip look lives here instead of in styles.css.
export const tooltipProps = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    color: "#000b27",
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
  },
  itemStyle: { color: "#000b27" },
  labelStyle: { color: "#4a546c" },
  cursor: { fill: "rgba(0, 11, 39, 0.04)" },
  separator: "",
};

export const animation = { isAnimationActive: false } as const;
