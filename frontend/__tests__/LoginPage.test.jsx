import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../src/pages/LoginPage';
import { BrowserRouter } from 'react-router-dom';
import * as authService from "../src/services/authService";
import { vi } from 'vitest';

// Wrapper con router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renderiza correctamente el formulario de login', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('permite escribir en los inputs', async () => {
    renderWithRouter(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('llama a login y guarda datos al hacer submit', async () => {
    // Mock de login (incluye guardado en localStorage, igual que tu implementación real)
    const mockLogin = vi.spyOn(authService, 'login').mockImplementation(async () => {
      localStorage.setItem('token', '123token');
      localStorage.setItem(
        'usuario',
        JSON.stringify({ nombre: 'Test', email: 'test@example.com' })
      );
      return {
        token: '123token',
        usuario: { nombre: 'Test', email: 'test@example.com' },
      };
    });

    renderWithRouter(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(localStorage.getItem('token')).toBe('123token');
    expect(JSON.parse(localStorage.getItem('usuario')).email).toBe('test@example.com');
  });

    it('muestra un mensaje de error si el login falla', async () => {
    // 🔧 Simulamos que el login lanza un error
    const mockLogin = vi
      .spyOn(authService, 'login')
      .mockRejectedValue(new Error('Credenciales inválidas'));

    renderWithRouter(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'fallo@example.com');
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    // ⏳ Esperamos que el mensaje de error aparezca
    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
    expect(mockLogin).toHaveBeenCalledWith('fallo@example.com', 'wrongpass');
  });

});
