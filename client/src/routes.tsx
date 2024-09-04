import { RouteObject } from "react-router-dom";

import ItemListPage from "./pages/ItemListPage/ItemListPage";
import TrashItemListPage from "./pages/TrashItemListPage/TrashItemListPage";
import FolderPage from "./pages/FolderPage/FolderPage";

export type RouteWithMeta = RouteObject & {
  searchable?: boolean;
};

const routes: RouteWithMeta[] = [
  {
    path: "/",
    element: <ItemListPage />,
    searchable: true,
  },
  {
    path: "/trash",
    element: <TrashItemListPage />,
    searchable: true,
  },
  {
    path: "/folder/:id",
    element: <FolderPage />,
    searchable: true,
  },
  {
    path: "/*",
    element: <span>404</span>,
  },
];

export default routes;
