import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cuentas from '../src/pages/Cuentas';
import { vi } from 'vitest';

vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve([]), // Simulamos que no hay cuentas inicialmente
        ok: true,
    })
));

vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => 'fake-token'),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
});

vi.mock("../src/hooks/useCuentas", () => ({
    default: () => ({
        cuentas: [
            {
                _id: "1",
                nombre: "Cuenta bancaria",
                tipo: "Banco",
                saldo: 1000,
                color: "#000000"
            },
        ],
        nombre: "",
        tipo: "",
        saldo: "",
        color: "#000000",
        modoEdicion: false,
        setNombre: vi.fn(),
        setTipo: vi.fn(),
        setSaldo: vi.fn(),
        setColor: vi.fn(),
        setModoEdicion: vi.fn(),
        handleGuardar: vi.fn(),
        handleEditar: vi.fn(),
        handleEliminar: vi.fn(),
        mensaje: ""
    })
}));

const renderWithRouter = () =>
    render(
        <BrowserRouter>
            <Cuentas />
        </BrowserRouter>
    );

describe('Cuentas', () => {
    it('muestra el título principal', async () => {
        renderWithRouter();
        expect(await screen.findByRole('heading', { name: /tus cuentas/i })).toBeInTheDocument();
    });

    it('muestra el formulario con inputs y botón para agregar cuenta', async () => {
        renderWithRouter();
        expect(await screen.findByPlaceholderText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/monto/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /agregar cuenta/i })).toBeInTheDocument();
    });

    it('desactiva el botón si hay 3 cuentas (simulando longitud)', async () => {
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        { _id: '1', nombre: 'Caja', tipoCuenta: 'efectivo', saldo: 1000 },
                        { _id: '2', nombre: 'Banco', tipoCuenta: 'cuenta', saldo: 2000 },
                        { _id: '3', nombre: 'MercadoPago', tipoCuenta: 'virtual', saldo: 3000 },
                    ]),
            })
        );
        renderWithRouter();
        expect(await screen.findByRole('button', { name: /agregar cuenta/i })).toBeDisabled();
    });

});
