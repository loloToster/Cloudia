import { Link } from "react-router-dom"
import "./Header.scss"

function Header() {
    return (
        <div className="header">
            <Link to="/" className="header__logo">
                Cloudia
            </Link>
            <Link to="/add" className="action-btn">
                Add Files
            </Link>
        </div>
    )
}

export default Header
