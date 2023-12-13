import ReactDOM from "react-dom/client"
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom"

import App from "./App"
import reportWebVitals from "./reportWebVitals"
import "./sass/style.scss"

import routes from "./routes"

const router = createBrowserRouter([{
  element: <App />,
  children: routes
}])

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(<RouterProvider router={router} />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
