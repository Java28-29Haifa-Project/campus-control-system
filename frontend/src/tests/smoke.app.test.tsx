
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "../App.tsx";

process.env.VITE_API_BASE_URL = "http://localhost:8080";

jest.mock("../layouts/AuthLayout", () => ({
    __esModule: true,
    default: () => {
        const { Outlet } = jest.requireActual("react-router-dom");
        return (
            <div data-testid="auth-layout">
                <Outlet />
            </div>
        );
    },
}));

jest.mock("../layouts/RootLayout", () => ({
    __esModule: true,
    default: () => <div data-testid="root-layout" />,
}));

jest.mock("../components/AuthVerify", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("../layouts/ProtectedRoute", () => ({
    __esModule: true,
    default: () => {
        const { Outlet } = jest.requireActual("react-router-dom");
        return <Outlet />;
    },
}));

jest.mock("../components/LoginForm", () => ({
    __esModule: true,
    default: () => <h1>LoginForm</h1>,
}));

jest.mock("../components/RegisterForm", () => ({
    __esModule: true,
    default: () => <h1>RegisterForm</h1>,
}));

jest.mock("../pages/servicePages/ErrorPage", () => ({
    __esModule: true,
    default: () => <h1>ErrorPage</h1>,
}));

describe("Smoke: App", () => {
    test("App render successfully", () => {
        expect(() => {
            render(
                <MemoryRouter initialEntries={["/"]}>
                    <App />
                </MemoryRouter>
            );
        }).not.toThrow();
    });

    test('Router started on "/" and show LoginForm', () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(
            screen.getByRole("heading", { name: /loginform/i })
        ).toBeInTheDocument();
    });
});