import { render, screen } from "@testing-library/react"
import { rest } from "msw"
import { setupServer } from "msw/node"
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

const server = setupServer(
    rest.get("/api/items", (req, res, ctx) => {
        return res(
            ctx.json([
                createDummyItem({
                    is_file: 1,
                    icon: "",
                    text: "",
                    title: "dummy.png"
                }),
                createDummyItem({
                    is_file: 1,
                    icon: "txt.png",
                    text: "",
                    title: "dummy.txt"
                }),
                createDummyItem({
                    is_file: 0,
                    icon: "",
                    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem eos nesciunt dolore numquam consequatur repellat quasi! Magnam doloremque veniam officia fuga, possimus sed consectetur labore. Nam exercitationem esse veniam accusantium.",
                    title: "dummy text"
                })
            ])
        )
    })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockItemList = () => (
    <BrowserRouter>
        <ItemList />
    </BrowserRouter>
)

describe("ItemList", () => {

    it("loads dummies", () => {
        render(<ItemList />)

        expect(screen.getAllByTestId(/dummy-/).length).toBe(5)
    })

    it("renders quick actions", async () => {
        render(<MockItemList />)

        const quickUpload = await screen.findByTitle("Upload Files")
        expect(quickUpload).toBeVisible()

        const addText = await screen.findByTitle("Add Text")
        expect(addText).toBeVisible()
    })

    it("renders right amount of items", async () => {
        render(<MockItemList />)

        // find titles of each item
        const items = await screen.findAllByText(/^dummy/)

        expect(items.length).toBe(3)
    })

})
