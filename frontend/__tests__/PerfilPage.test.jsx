import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PerfilPage from '../src/pages/PerfilPage';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../src/components/MainLayout', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

const mockUsuario = {
    nombre: 'Matías',
    email: 'mati@example.com',
};

const mockGrupo = [
    {
        grupoFamiliarId: {
            nombre: 'Grupo Test',
        },
    },
];

const renderWithRouter = () => render(<BrowserRouter><PerfilPage /></BrowserRouter>);

describe('PerfilPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url.includes('/usuarios/perfil')) {
                return Promise.resolve({ ok: true, json: async () => ({ ...mockUsuario, grupoFamiliarId: true }) });
            }
            if (url.includes('/grupo/miembros')) {
                return Promise.resolve({ ok: true, json: async () => mockGrupo });
            }
            return Promise.reject(new Error('No match'));
        });

        localStorage.setItem('token', 'fake-token');
    });

    it('muestra los datos del usuario correctamente', async () => {
        renderWithRouter();
        expect(await screen.findByText('Matías')).toBeInTheDocument();
        expect(screen.getByText('mati@example.com')).toBeInTheDocument();
    });

    it('muestra los campos del formulario de contraseña', async () => {
        renderWithRouter();

        expect(await screen.findByPlaceholderText(/contraseña actual/i)).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText(/nueva contraseña/i)[0]).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirmar nueva contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
    });

    it('muestra mensaje si las contraseñas no coinciden', async () => {
        renderWithRouter();

        await userEvent.type(await screen.findByPlaceholderText(/contraseña actual/i), '1234');
        const [nueva, confirmar] = screen.getAllByPlaceholderText(/nueva contraseña/i);
        await userEvent.type(nueva, 'abcd');
        await userEvent.type(confirmar, 'xyz');

        await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
        screen.debug();

        expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    it('muestra el nombre del grupo si está presente', async () => {
        renderWithRouter();
        expect(await screen.findByText(/grupo familiar/i)).toBeInTheDocument();
        expect(await screen.findByText(/grupo test/i)).toBeInTheDocument();
    });
});
