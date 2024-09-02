import { useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"

import routes from "src/routes"
import { useSearch } from "src/contexts/searchContext"

import "./Header.scss"

function Header() {
    const location = useLocation()

    const { searchQuery, setSearchQuery } = useSearch()

    const searchInput = useRef<HTMLInputElement>(null)

    const handleSearchEnter = () => {
        searchInput.current?.focus()
    }

    const handleSearchClear = () => {
        setSearchQuery("")
        searchInput.current?.focus()
    }

    // clear search on page change
    useEffect(() => {
        setSearchQuery("")
    }, [location.pathname, setSearchQuery])

    return (
        <div className="header">
            <Link to="/" className="header__logo">
                Cloudia
            </Link>
            {routes.find(r => r.path === location.pathname)?.searchable ? (
                <div className="header__search">
                    {searchQuery ? (
                        <button onClick={handleSearchClear}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                            </svg>
                        </button>
                    ) : (
                        <button onClick={handleSearchEnter}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                            </svg>
                        </button>
                    )}
                    <input type="text"
                        ref={searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search Cloudia" />
                </div>
            ) : (
                <div className="header__spacer"></div>
            )}
            <Link to="/trash" className="header__secondary">
                <span>Trash</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                    <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z"></path>
                </svg>
            </Link>
        </div>
    )
}

export default Header
