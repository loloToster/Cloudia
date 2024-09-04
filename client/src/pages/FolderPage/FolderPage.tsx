import { useParams } from "react-router-dom";
import ItemList from "src/components/ItemList/ItemList";

function FolderPage() {
  const { id } = useParams();

  return <ItemList apiUrl={"/api/folder/" + id} folderId={id} />;
}

export default FolderPage;
