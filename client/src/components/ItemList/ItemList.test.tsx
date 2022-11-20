import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

import { Item } from "@backend-types/types"

import ItemList from "./ItemList"

function createDummyItem(data: Omit<Item, "id" | "created_at" | "ip">) {
    return {
        ...data,
        id: "id" + Math.random().toString(16).slice(2),
        ip: "0.0.0.0",
        created_at: new Date()
    }
}

const MockItemList = (props: any) => (
    <BrowserRouter>
        <ItemList {...props} />
    </BrowserRouter>
)

describe("ItemList", () => {
    const testItems = [
        createDummyItem({
            is_file: 1,
            is_img: 1,
            text: "",
            title: "dummy.png"
        }),
        createDummyItem({
            is_file: 1,
            is_img: 0,
            text: "",
            title: "dummy.txt"
        }),
        createDummyItem({
            is_file: 0,
            is_img: 0,
            text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
            title: "dummy text"
        })
    ]

    it("renders dummies", () => {
        render(<ItemList loading items={[]} setItems={() => { }} />)

        expect(screen.getAllByTestId(/dummy-/).length).toBe(5)
    })

    it("renders quick actions", async () => {
        render(<MockItemList items={[]} />)

        const quickUpload = await screen.findByTitle("Upload Files")
        expect(quickUpload).toBeVisible()

        const addText = await screen.findByTitle("Add Text")
        expect(addText).toBeVisible()
    })

    it("renders right amount of items", async () => {
        render(<MockItemList items={testItems} />)

        // find titles of each item
        const items = await screen.findAllByText(/^dummy/)

        expect(items.length).toBe(3)
    })

})
