import React from "react";
import { useLocation } from "@reach/router";

export const SwitchLayoutButton = ({ currentLayout }) => {
  const location = useLocation();

  const targetLayout = currentLayout === "book" ? "book2" : "book";
  const buttonText =
    currentLayout === "book"
      ? "🔁 Switch to Vertical View"
      : "🔁 Switch to Two-Column View";

  const currentSearch = location.search; // es: ?id=150&tb=f_fonti
  const href = `/${targetLayout}/${currentSearch}`;

  return (
    <div className="text-end mb-4">
      <a className="btn btn-outline-secondary" href={href}>
        {buttonText}
      </a>
    </div>
  );
};
