import {
    Dispatch,
    SetStateAction,
    createContext,
    useContext,
    useState
} from "react"
import { ClientItem } from "@backend-types/types"

export type ItemSetter = Dispatch<SetStateAction<ClientItem[]>>
export type LoadingSetter = Dispatch<SetStateAction<boolean>>

export interface ItemsCacheContextI {
    items: ClientItem[]
    loadingItems: boolean
    setLoadingItems: LoadingSetter
    setItems: ItemSetter
    trashedItems: ClientItem[]
    loadingTrashedItems: boolean
    setLoadingTrashedItems: LoadingSetter
    setTrashedItems: ItemSetter
}

export const ItemsCacheContext = createContext<ItemsCacheContextI>({
    items: [],
    loadingItems: true,
    setLoadingItems: () => null,
    setItems: () => null,
    trashedItems: [],
    loadingTrashedItems: true,
    setLoadingTrashedItems: () => null,
    setTrashedItems: () => null
})

export const ItemsCacheContextProvider = (props: {
    children: React.ReactNode
}) => {
    const [items, setItems] = useState<ClientItem[]>([])
    const [loadingItems, setLoadingItems] = useState(true)
    const [trashedItems, setTrashedItems] = useState<ClientItem[]>([])
    const [loadingTrashedItems, setLoadingTrashedItems] = useState(true)

    return (
        <ItemsCacheContext.Provider value={{
            items,
            loadingItems,
            setLoadingItems,
            setItems,
            trashedItems,
            loadingTrashedItems,
            setLoadingTrashedItems,
            setTrashedItems
        }}>
            {props.children}
        </ItemsCacheContext.Provider>
    )
}

export const useItemsCache = () => {
    return useContext(ItemsCacheContext)
}
