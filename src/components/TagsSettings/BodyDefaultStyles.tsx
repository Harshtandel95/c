import { TagStyles } from "./types";
export const bodyDefaultStyles = (): TagStyles => ({
  h1: { fontSize: "2.5rem", color: "#1a1a1a", marginBottom: "1rem" },
  h2: { fontSize: "2rem", color: "#2a2a2a", marginBottom: "0.875rem" },
  h3: { fontSize: "1.75rem", color: "#3a3a3a", marginBottom: "0.75rem" },
  p: { fontSize: "1rem", color: "#4a4a4a", marginBottom: "1rem" },
  ul: { marginLeft: "1.5rem", marginBottom: "1rem" },
  li: { fontSize: "1rem", color: "#4a4a4a", marginBottom: "0.5rem" },
  a: { color: "#7c3aed", textDecoration: "underline" },
});
