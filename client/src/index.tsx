import ReactDOM from "react-dom/client"
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom"

import App from "./App"
import reportWebVitals from "./reportWebVitals"
import "./sass/style.scss"

import ItemListPage from "./pages/ItemListPage/ItemListPage"
import AddFilePage from "./pages/AddFilesPage/AddFilesPage"
import TrashItemListPage from "./pages/TrashItemListPage/TrashItemListPage"
import FileDetailsPage from "./pages/FileDetailsPage/FileDetailsPage"

const router = createBrowserRouter([{
  element: <App />,
  children: [
    {
      path: "/",
      element: <ItemListPage />
    },
    {
      path: "/add",
      element: <AddFilePage />
    },
    {
      path: "/trash",
      element: <TrashItemListPage />
    },
    {
      path: "/file/:id",
      element: <FileDetailsPage />
    },
    {
      path: "/*",
      element: <span>404</span>
    }
  ]
}])

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(<RouterProvider router={router} />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
