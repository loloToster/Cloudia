import { Outlet, ScrollRestoration } from "react-router-dom";

import { CacheContextProvider } from "./contexts/itemsCacheContext";
import { SearchContextProvider } from "./contexts/searchContext";

import Header from "./components/Header/Header";

function App() {
  return (
    <div className="app">
      <CacheContextProvider>
        <SearchContextProvider>
          <Header />
          <Outlet />
        </SearchContextProvider>
      </CacheContextProvider>
      <ScrollRestoration />
    </div>
  );
}

export default App;
