// __tests__/GrupoFamiliar.test.jsx
import { render, screen } from "@testing-library/react";
import GrupoFamiliar from "../src/pages/GrupoFamiliar";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../src/hooks/useGrupoFamiliar", () => ({
    default: () => ({
        tieneGrupo: false,
        esAdmin: false,
        miembros: [],
        nombreGrupo: "",
        emailInvitar: "",
        setEmailInvitar: vi.fn(),
        handleCrearGrupo: vi.fn(),
        handleEliminarGrupo: vi.fn(),
        handleEliminarMiembro: vi.fn(),
        handleInvitar: vi.fn(),
        mensaje: "",
    }),
}));

const renderWithRouter = () =>
    render(
        <BrowserRouter>
            <GrupoFamiliar />
        </BrowserRouter>
    );

describe("GrupoFamiliar (sin grupo)", () => {
    it("muestra mensaje y botón de crear grupo si no pertenece a uno", () => {
        renderWithRouter();

        expect(
            screen.getByText(/aún no pertenecés a un grupo familiar/i)
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /crear grupo/i })).toBeInTheDocument();
    });

    it("muestra el título 'Grupo Familiar' en la pantalla", () => {
        renderWithRouter();

        expect(screen.getByRole("heading", { name: /grupo familiar/i })).toBeInTheDocument();
    });


    it("no muestra inputs ni opciones de administración si no es admin", () => {
        renderWithRouter();

        expect(screen.queryByText(/invitar a un usuario/i)).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/email del usuario a invitar/i)).not.toBeInTheDocument();
    });

    it("no muestra mensaje si el hook devuelve un string vacío", () => {
        renderWithRouter();
        expect(screen.queryByTestId("mensaje-feedback")).not.toBeInTheDocument();
    });

});

