import ItemList from "src/components/ItemList/ItemList";

function ItemListPage() {
  return <ItemList apiUrl="/api/items?trashed=true" showQuickActions={false} />;
}

export default ItemListPage;
