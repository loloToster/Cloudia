import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

import Header from "./Header"

const MockHeader = () => (
    <BrowserRouter>
        <Header />
    </BrowserRouter >
)

describe("Header", () => {

    it("renders logo", () => {
        render(<MockHeader />)
        const logo = screen.getByText("Cloudia")
        expect(logo).toBeVisible()
    })

})
