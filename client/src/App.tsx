import { Outlet, ScrollRestoration } from "react-router-dom"

import { ItemsCacheContextProvider } from "./contexts/itemsCacheContext"
import Header from "./components/Header/Header"

function App() {
    return (
        <div className="app">
            <ItemsCacheContextProvider>
                <Header />
                <Outlet />
            </ItemsCacheContextProvider>
            <ScrollRestoration />
        </div>
    )
}

export default App
