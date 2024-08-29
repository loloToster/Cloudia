import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { ClientFileJson } from "@backend-types/types"

import FileItem from "./FileItem"

function createDummyFileItemData(): ClientFileJson {
    return {
        type: "img",
        id: "123",
        ip: "0.0.0.0",
        title: "dummy.png",
        created_at: new Date(),
        trashed: 0,
        selected: false,
        folder: null
    }
}

const MockFileItem = (
    { fileItem, onDelete, onRestore, onClick }: {
        fileItem: ClientFileJson,
        onDelete?: Function,
        onRestore?: Function,
        onClick?: Function
    }
) => {
    const handleDelete = onDelete || (() => { })
    const handleRestore = onRestore || (() => { })
    const handleSelect = () => { }

    return (
        <BrowserRouter >
            <FileItem
                fileItem={fileItem}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onSelect={handleSelect}
                onRangeSelect={handleSelect} />
        </BrowserRouter>
    )
}

describe("FileItem", () => {

    it("renders title", () => {
        let itemData = createDummyFileItemData()
        itemData.title = "test.txt"

        render(<MockFileItem fileItem={itemData} />)

        expect(screen.getByText(itemData.title)).toBeInTheDocument()
    })

    it("renders ip", () => {
        let itemData = createDummyFileItemData()
        itemData.ip = "127.0.0.1"

        render(<MockFileItem fileItem={itemData} />)

        expect(screen.getByText(itemData.ip)).toBeInTheDocument()
    })

    it("has working download button", () => {
        let itemData = createDummyFileItemData()
        itemData.id = "testId"

        render(<MockFileItem fileItem={itemData} />)

        const downloadBtn: HTMLAnchorElement = screen.getByTitle("Download File")

        expect(downloadBtn).toHaveAttribute("download", itemData.id)
        expect(downloadBtn.href).toMatch(/\/cdn\/testId$/)
    })

    it("has working delete button", () => {
        let itemData = createDummyFileItemData()
        itemData.id = "testId"

        const dummyDelete = jest.fn()

        render(<MockFileItem fileItem={itemData} onDelete={dummyDelete} />)

        const deleteBtn = screen.getByTitle("Delete File")

        deleteBtn.click()

        expect(dummyDelete).toHaveBeenCalledWith(itemData.id)
    })

    it("renders icon if present", () => {
        let itemData = createDummyFileItemData()
        itemData.type = "file"
        itemData.title = "test.txt"

        render(<MockFileItem fileItem={itemData} />)

        const img: HTMLImageElement = screen.getByAltText("icon")

        expect(img.src).toMatch(/\/icon\/test.txt$/)
    })

    it("renders preview if no icon", () => {
        let itemData = createDummyFileItemData()
        itemData.id = "testId"

        render(<MockFileItem fileItem={itemData} />)

        const img: HTMLImageElement = screen.getByAltText("icon")

        expect(img.src).toMatch(/\/cdn\/testId$/)
    })

})
