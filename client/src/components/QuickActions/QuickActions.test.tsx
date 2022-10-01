import { render, screen } from "@testing-library/react"

import QuickActions from "./QuickActions"

describe("QuickActions", () => {

    it("hides file upload on add text click", () => {
        render(<QuickActions upload={(async () => { })} />)

        const uploadBtn = screen.getByTitle("Upload Files")
        const addTextBtn = screen.getByTitle("Add Text")

        addTextBtn.click()

        expect(uploadBtn).toHaveClass("hidden")
    })

})
