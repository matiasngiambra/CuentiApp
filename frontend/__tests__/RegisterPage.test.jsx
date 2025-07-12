import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// 👇 declaramos el mock arriba de todo
const mockNavigate = vi.fn();

// 👇 mockeamos react-router-dom ANTES de importar RegisterPage
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import RegisterPage from '../src/pages/RegisterPage';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockReset();
  });

  it('renderiza correctamente los campos del formulario', () => {
    renderWithRouter(<RegisterPage />);
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('permite escribir en los campos del formulario', async () => {
    renderWithRouter(<RegisterPage />);
    await userEvent.type(screen.getByPlaceholderText(/nombre/i), 'Matías');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'mati@example.com');
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'securepass');

    expect(screen.getByPlaceholderText(/nombre/i)).toHaveValue('Matías');
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue('mati@example.com');
    expect(screen.getByPlaceholderText(/contraseña/i)).toHaveValue('securepass');
  });

  it('muestra mensaje de éxito si el registro es exitoso', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ mensaje: 'Usuario creado' }),
    });

    renderWithRouter(<RegisterPage />);

    await userEvent.type(screen.getByPlaceholderText(/nombre/i), 'Matías');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'mati@example.com');
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'securepass');
    await userEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText(/cuenta creada con éxito/i)).toBeInTheDocument();
  });

  it('muestra mensaje de error si el registro falla', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ mensaje: 'El email ya está registrado' }),
    });

    renderWithRouter(<RegisterPage />);

    await userEvent.type(screen.getByPlaceholderText(/nombre/i), 'Matías');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'yaexiste@example.com');
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'securepass');
    await userEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText(/el email ya está registrado/i)).toBeInTheDocument();
  });

  it('navega al login al hacer click en "Iniciar sesión"', async () => {
    renderWithRouter(<RegisterPage />);
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
