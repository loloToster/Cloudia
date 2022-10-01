import { render, screen } from "@testing-library/react"

import UploadItem from "./UploadItem"

describe("UploadItem", () => {

    it("handles single file", () => {
        render(<UploadItem numberOfFiles={1} progress={0} />)

        expect(screen.getByText("Uploading 1 file")).toBeInTheDocument()
    })

    it("handles multpile files", () => {
        render(<UploadItem numberOfFiles={3} progress={0} />)

        expect(screen.getByText("Uploading 3 files")).toBeInTheDocument()
    })

    it("has working progress", () => {
        render(<UploadItem numberOfFiles={1} progress={0.5} />)

        expect(screen.getByTestId("progress-circle")).toHaveStyle("--progress: 0.5")
        expect(screen.getByText("50%")).toBeInTheDocument()
    })

})
