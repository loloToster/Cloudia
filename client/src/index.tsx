import ReactDOM from "react-dom/client"
import "./sass/style.scss"
import App from "./components/App"

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

root.render(<App />)
