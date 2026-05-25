/**
 * Tests for the LoginPage component.
 * useAuth (auth context) and useNavigate (router) are mocked.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './login';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/context/auth-context';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockNavigate.mockReset();
    // react-router-dom's useNavigate is provided via MemoryRouter — no extra mock needed.
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn().mockResolvedValue(null),
      logout: jest.fn(),
    });
  });

  test('renders the sign-in heading and email/password fields', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('shows validation error when submitting with empty fields', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('calls login with entered credentials on submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue(null);
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: mockLogin,
      logout: jest.fn(),
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'password');
    });
  });

  test('shows an error message when login returns an error string', async () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn().mockResolvedValue('Invalid email or password'),
      logout: jest.fn(),
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  test('disables the submit button while login is in progress', async () => {
    // login never resolves during this test
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn().mockReturnValue(new Promise(() => {})),
      logout: jest.fn(),
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
});
