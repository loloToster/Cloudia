import { Link } from "react-router-dom"

function Header() {
    return (
        <div className="header">
            <Link to="/" className="header__logo">
                Cloudia
            </Link>
            <Link to="/add" className="action-btn">
                Add Image
            </Link>
        </div>
    )
}

export default Header
