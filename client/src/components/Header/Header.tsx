import { Link, useLocation } from "react-router-dom"
import "./Header.scss"

function Header() {
    const location = useLocation()

    return (
        <div className="header">
            <Link to="/" className="header__logo">
                Cloudia
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
