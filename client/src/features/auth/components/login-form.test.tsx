/**
 * Tests for the LoginForm component.
 * The useLogin hook is mocked so tests are fully isolated from the auth
 * context, the API and the router.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './login-form';

jest.mock('../hooks/use-login', () => ({
  useLogin: jest.fn(),
}));

import { useLogin } from '../hooks/use-login';

describe('LoginForm', () => {
  beforeEach(() => {
    jest.mocked(useLogin).mockReturnValue({
      login: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  test('renders the sign-in heading and email/password fields', () => {
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('shows validation error when submitting with empty fields', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('calls login with entered credentials on submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);
    jest.mocked(useLogin).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });

    render(<LoginForm />);
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

  test('shows the error message from the login hook', () => {
    jest.mocked(useLogin).mockReturnValue({
      login: jest.fn().mockResolvedValue(false),
      isLoading: false,
      error: 'Invalid email or password',
    });

    render(<LoginForm />);
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  test('disables the submit button while login is in progress', () => {
    jest.mocked(useLogin).mockReturnValue({
      login: jest.fn(),
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
