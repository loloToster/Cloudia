import { Link, useLocation } from "react-router-dom"
import "./Header.scss"

function Header() {
    const location = useLocation()

    return (
        <div className="header">
            <Link to="/" className="header__logo">
                Cloudia
            </Link>
            <Link to="/trash" className="header__secondary">
                <span>Trash</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                    <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2ZM7 6v13Z"></path>
                </svg>
            </Link>
            {location.pathname !== "/add" && (
                <>
                    <Link to="/add" className="action-btn">
                        Add Files
                    </Link>
                    <Link to="/add" className="header__fab">
                        +
                    </Link>
                </>
            )}
        </div>
    )
}

export default Header
