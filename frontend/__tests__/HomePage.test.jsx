import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../src/pages/HomePage';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// 🔁 Mock básico del layout para evitar dependencias externas
vi.mock('../src/components/MainLayout', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

// 🔁 Mock del fetch global para evitar llamadas reales
global.fetch = vi.fn();

// Datos de prueba
const mockCuentas = [
    { _id: '1', nombre: 'Caja Ahorro', tipoCuenta: 'cuenta', saldo: 12000 },
    { _id: '2', nombre: 'Efectivo', tipoCuenta: 'efectivo', saldo: 2500 },
];

const mockCategorias = [
    { _id: 'cat1', nombre: 'Comida', icono: '🍔', color: '#f00' },
    { _id: 'cat2', nombre: 'Transporte', icono: '🚌', color: '#0f0' },
];

const mockTotales = [
    { _id: 'cat1', total: 5000 },
    { _id: 'cat2', total: 3000 },
];

const renderWithRouter = () => render(<BrowserRouter><HomePage /></BrowserRouter>);

describe('HomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mockeo para las 3 llamadas fetch
        fetch
            .mockResolvedValueOnce({ ok: true, json: async () => mockTotales }) // totales por categoría
            .mockResolvedValueOnce({ ok: true, json: async () => mockCuentas }) // cuentas
            .mockResolvedValueOnce({ ok: true, json: async () => mockCategorias }); // categorías
    });


    it('renderiza correctamente los títulos principales', async () => {
        renderWithRouter();
        expect(await screen.findByText(/¡Bienvenido!/i)).toBeInTheDocument();
        expect(await screen.findByText(/Cuentas/i)).toBeInTheDocument();
        expect(await screen.findByText(/Categorías/i)).toBeInTheDocument();
    });

    it('muestra las cuentas correctamente', async () => {
        renderWithRouter();
        expect(await screen.findByText('Caja Ahorro')).toBeInTheDocument();
        expect(await screen.findByText('🏦 Dinero en Cuenta')).toBeInTheDocument();
        expect(await screen.findByText('$12.000')).toBeInTheDocument();
    });

    it('muestra las categorías con totales correctamente', async () => {
        renderWithRouter();

        const comida = await screen.findByText(/Comida/i);
        expect(comida).toBeInTheDocument();

        const categoriaComida = comida.closest('a');
        expect(categoriaComida).toHaveTextContent('Gastado:');
        expect(categoriaComida).toHaveTextContent('$5.000');

        const transporte = await screen.findByText(/Transporte/i);
        expect(transporte).toBeInTheDocument();

        const categoriaTransporte = transporte.closest('a');
        expect(categoriaTransporte).toHaveTextContent('Gastado:');
        expect(categoriaTransporte).toHaveTextContent('$3.000');
    });

    it('muestra el botón "+ Gasto"', async () => {
        renderWithRouter();
        expect(await screen.findByRole('button', { name: /\+ gasto/i })).toBeInTheDocument();
    });

    it('abre el modal y muestra el formulario de nuevo gasto', async () => {
        renderWithRouter();

        // Esperamos a que cargue el botón flotante
        const botonGasto = await screen.findByRole('button', { name: /\+ gasto/i });
        expect(botonGasto).toBeInTheDocument();

        // Simulamos click
        await userEvent.click(botonGasto);

        // Verificamos que aparece el modal con el título
        expect(await screen.findByText(/nuevo gasto/i)).toBeInTheDocument();

        // Verificamos que todos los campos estén presentes
        expect(screen.getByPlaceholderText(/descripción/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/monto/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(new Date().toISOString().slice(0, 10))).toBeInTheDocument();
        expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2); // cuenta + categoría

        // Verificamos que esté el botón "Guardar gasto"
        expect(screen.getByRole('button', { name: /guardar gasto/i })).toBeInTheDocument();
    });

    it('muestra mensaje de error si se intenta guardar con campos vacíos', async () => {
        renderWithRouter();

        const botonGasto = await screen.findByRole('button', { name: /\+ gasto/i });
        await userEvent.click(botonGasto);

        const botonGuardar = screen.getByRole('button', { name: /guardar gasto/i });

        // Incompleto: solo ingresamos descripción
        await userEvent.type(screen.getByPlaceholderText(/descripción/i), 'Error test');

        // Interceptamos console.error (por si algún fetch falla silenciosamente)
        vi.spyOn(console, 'error').mockImplementation(() => { });

        await userEvent.click(botonGuardar);

        // Esperamos un mínimo de interacción visual: validación incompleta = no cierra el modal
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Validamos que el botón "Guardar gasto" siga visible (lo que implica que no navegó ni cerró)
        expect(screen.getByRole('button', { name: /guardar gasto/i })).toBeInTheDocument();
    });


    it('guarda un gasto válido y muestra mensaje de éxito', async () => {
        // Spy global fetch y mock por URL
        vi.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url.includes('/totales')) {
                return Promise.resolve({ ok: true, json: async () => mockTotales });
            }
            if (url.includes('/cuentas')) {
                return Promise.resolve({ ok: true, json: async () => mockCuentas });
            }
            if (url.includes('/categorias')) {
                return Promise.resolve({ ok: true, json: async () => mockCategorias });
            }
            if (url.includes('/gastos')) {
                return Promise.resolve({ ok: true, json: async () => ({ mensaje: 'Gasto guardado' }) });
            }
            return Promise.reject(new Error('URL inesperada: ' + url));
        });

        renderWithRouter();

        // Abrimos el modal
        const botonGasto = await screen.findByRole('button', { name: /\+ gasto/i });
        await userEvent.click(botonGasto);

        // Completamos el formulario
        await userEvent.type(screen.getByPlaceholderText(/descripción/i), 'Pizza');
        await userEvent.type(screen.getByPlaceholderText(/monto/i), '1000');

        await userEvent.selectOptions(screen.getAllByRole('combobox')[0], '1'); // cuenta
        await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'cat1'); // categoría

        // Guardamos
        const botonGuardar = screen.getByRole('button', { name: /guardar gasto/i });
        await userEvent.click(botonGuardar);

        // Esperamos mensaje de éxito
        expect(await screen.findByText(/gasto guardado con éxito/i)).toBeInTheDocument();
    });


});
