import { render, screen } from "@testing-library/react"

import ActionBtn from "./ActionBtn"

describe("Action Button", () => {

    it("renders basic action btn", () => {
        render(<ActionBtn text="Test" />)

        expect(screen.getByText("Test")).toBeInTheDocument()
    })

    it("renders loading action btn", () => {
        const textLoading = "Loading"

        render(<ActionBtn textLoading={textLoading} />)

        expect(screen.getByText(textLoading)).toBeInTheDocument()
        expect(screen.getAllByText(".").length).toBe(3)
    })

    it("executes onClick function", () => {
        const handleClick = jest.fn()

        render(<ActionBtn text="Test" onClick={handleClick} />)

        screen.getByText("Test").click()

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("loads anchor instead of button if onClick is string", () => {
        const href = "/test"

        render(<ActionBtn text="Test" onClick={href} />)

        const btn = screen.getByText("Test")

        expect(btn.closest("a")).toHaveAttribute("href", href)
    })

    it("has working progress", () => {
        render(<ActionBtn text="Test" loading progress={0.5} />)

        expect(screen.getByTestId("progress-bar")).toHaveStyle("--value: 0.5")
        expect(screen.getByText(/\(50%\)/)).toBeInTheDocument()
    })

})
