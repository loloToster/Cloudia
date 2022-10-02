import { render, screen } from "@testing-library/react"

import UploadedFilesList from "./UploadedFilesList"

describe("UploadedFilesList", () => {
    // neccessary because createObjectURL function is not available in jest-dom
    global.URL.createObjectURL = () => ""

    const testFiles = [
        new File([], "test.png"),
        new File([], "test.txt"),
        new File([], "test.pdf")
    ]

    it("renders correct files", () => {
        render(<UploadedFilesList files={testFiles} handleDelete={() => { }} />)

        for (const file of testFiles) {
            expect(screen.getByText(file.name)).toBeInTheDocument()
        }
    })

    it("has working remove button", () => {
        const handleDelete = jest.fn()

        render(<UploadedFilesList files={testFiles} handleDelete={handleDelete} />)

        screen.getAllByTitle("Remove File").forEach(rmBtn => rmBtn.click())

        expect(handleDelete.mock.calls).toEqual(
            testFiles.map(f => [f])
        )
    })

})
