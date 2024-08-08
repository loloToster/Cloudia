import { RouteObject } from "react-router-dom"

import ItemListPage from "./pages/ItemListPage/ItemListPage"
import AddFilePage from "./pages/AddFilesPage/AddFilesPage"
import TrashItemListPage from "./pages/TrashItemListPage/TrashItemListPage"
import FileDetailsPage from "./pages/FileDetailsPage/FileDetailsPage"

export type RouteWithMeta = RouteObject & {
    searchable?: boolean
}

const routes: RouteWithMeta[] = [
    {
        path: "/",
        element: <ItemListPage />,
        searchable: true
    },
    {
        path: "/trash",
        element: <TrashItemListPage />,
        searchable: true
    },
    {
        path: "/add",
        element: <AddFilePage />
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

export default routes
