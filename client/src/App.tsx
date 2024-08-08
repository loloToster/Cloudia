import { Outlet, ScrollRestoration } from "react-router-dom"

import { ItemsCacheContextProvider } from "./contexts/itemsCacheContext"
import { SearchContextProvider } from "./contexts/searchContext"

import Header from "./components/Header/Header"

function App() {
    return (
        <div className="app">
            <ItemsCacheContextProvider>
                <SearchContextProvider>
                    <Header />
                    <Outlet />
                </SearchContextProvider>
            </ItemsCacheContextProvider>
            <ScrollRestoration />
        </div>
    )
}

export default App
