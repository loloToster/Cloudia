import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import routes from "src/routes";
import { useSearch } from "src/contexts/searchContext";

import "./Header.scss";

function comparePaths(pathSource: string, path: string): boolean {
  const splitter = "/";
  const wildcard = ":";

  const split = (p: string) => p.split(splitter).filter((s) => s);
  const splittedPathSource = split(pathSource);
  const splittedPath = split(path);

  if (splittedPathSource.length !== splittedPath.length) return false;

  for (let i = 0; i < splittedPath.length; i++) {
    const pathSourcePart = splittedPathSource[i];
    const pathPart = splittedPath[i];

    if (pathSourcePart.startsWith(wildcard)) continue;

    if (pathSourcePart !== pathPart) return false;
  }

  return true;
}

function Header() {
  const location = useLocation();

  const { searchQuery, setSearchQuery } = useSearch();

  const searchInput = useRef<HTMLInputElement>(null);

  const handleSearchEnter = () => {
    searchInput.current?.focus();
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    searchInput.current?.focus();
  };

  // clear search on page change
  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname, setSearchQuery]);

  return (
    <div className="header">
      <Link to="/" className="header__logo">
        Cloudia
      </Link>
      {routes.find((r) => r.path && comparePaths(r.path, location.pathname))
        ?.searchable ? (
        <div className="header__search">
          {searchQuery ? (
            <button onClick={handleSearchClear}>
              <span className="material-symbols-rounded">close</span>
            </button>
          ) : (
            <button onClick={handleSearchEnter}>
              <span className="material-symbols-rounded">search</span>
            </button>
          )}
          <input
            type="text"
            ref={searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Cloudia"
          />
        </div>
      ) : (
        <div className="header__spacer"></div>
      )}
      <Link to="/trash" className="header__secondary">
        <span>Trash</span>
        <span className="material-symbols-rounded">delete</span>
      </Link>
    </div>
  );
}

export default Header;
