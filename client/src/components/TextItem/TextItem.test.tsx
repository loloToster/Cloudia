import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TextJson } from "@backend-types/types"

import TextItem from "./TextItem"

function createDummyTextItemData(): TextJson {
    return {
        type: "text",
        id: "123",
        ip: "0.0.0.0",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda natus vitae cumque laboriosam a, quos excepturi facere sapiente voluptatibus. Consectetur odio eius numquam quaerat ratione illo aspernatur libero, assumenda sed.",
        title: "Lorem Ipsum",
        created_at: new Date(),
        trashed: 0
    }
}

const MockTextItem = (
    { textItem, onDelete, onRestore }: {
        textItem: TextJson,
        onDelete?: Function,
        onRestore?: Function
    }
) => {
    const handleDelete = onDelete || (() => { })
    const handleRestore = onRestore || (() => { })

    return (<TextItem textItem={textItem} onDelete={handleDelete} onRestore={handleRestore} />)
}

describe("TextItem", () => {

    it("renders title", () => {
        let itemData = createDummyTextItemData()
        itemData.title = "Test"

        render(<MockTextItem textItem={itemData} />)

        expect(screen.getByText(itemData.title)).toBeInTheDocument()
    })

    it("renders ip", () => {
        let itemData = createDummyTextItemData()
        itemData.ip = "127.0.0.1"

        render(<MockTextItem textItem={itemData} />)

        expect(screen.getByText(itemData.ip)).toBeInTheDocument()
    })

    it("renders contents", () => {
        let itemData = createDummyTextItemData()

        render(<MockTextItem textItem={itemData} />)

        expect(screen.getByText(itemData.text)).toBeInTheDocument()
    })

    it("has working delete button", () => {
        let itemData = createDummyTextItemData()
        itemData.id = "testId"

        const dummyDelete = jest.fn()

        render(<MockTextItem textItem={itemData} onDelete={dummyDelete} />)

        const deleteBtn = screen.getByTitle("Delete Text")

        deleteBtn.click()

        expect(dummyDelete).toHaveBeenCalledWith(itemData.id)
    })

    it("has working copy button", async () => {
        const user = userEvent.setup({ writeToClipboard: true })

        let itemData = createDummyTextItemData()
        render(<MockTextItem textItem={itemData} />)

        const copyBtn = screen.getByTitle("Copy Text")
        await user.click(copyBtn)

        // empty input is neccessary to get text from user object
        const blankInput = document.body.appendChild(document.createElement("input"))
        blankInput.focus()
        await user.paste()

        expect(blankInput).toHaveValue(itemData.text)
    })

})
