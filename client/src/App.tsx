import { Outlet, ScrollRestoration } from "react-router-dom";

import { CacheContextProvider } from "./contexts/cacheContext";
import { ZipContext, ZipContextProvider } from "./contexts/zipContext";
import { SearchContextProvider } from "./contexts/searchContext";

import Header from "./components/Header/Header";
import Compressing from "./components/Compressing/Compressing";

function App() {
  return (
    <div className="app">
      <CacheContextProvider>
        <ZipContextProvider>
          <SearchContextProvider>
            <Header />
            <Outlet />
          </SearchContextProvider>
          <ZipContext.Consumer>
            {({ zipsInProgress }) => Boolean(zipsInProgress) && <Compressing />}
          </ZipContext.Consumer>
        </ZipContextProvider>
      </CacheContextProvider>
      <ScrollRestoration />
    </div>
  );
}

export default App;
