/**
 * Tests for the CreateUserSheet component.
 * The useCreateUser hook is mocked so tests are fully isolated from the API.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateUserSheet } from './create-user-sheet';

jest.mock('../hooks/use-users', () => ({
  useCreateUser: jest.fn(),
}));

import { useCreateUser } from '../hooks/use-users';

function renderSheet(onCreated = jest.fn()) {
  return render(<CreateUserSheet onCreated={onCreated} />);
}

function fillForm(values: { name?: string; email?: string; password?: string }) {
  if (values.name !== undefined) {
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: values.name } });
  }
  if (values.email !== undefined) {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: values.email } });
  }
  if (values.password !== undefined) {
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: values.password } });
  }
}

describe('CreateUserSheet', () => {
  beforeEach(() => {
    jest.mocked(useCreateUser).mockReturnValue({
      create: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  async function openSheet() {
    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));
    await waitFor(() => screen.getByRole('button', { name: /Create User/i }));
  }

  test('renders the "Add User" trigger button', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
  });

  test('shows a validation error when submitted with empty fields', async () => {
    renderSheet();
    await openSheet();

    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  test('shows a validation error for an invalid email', async () => {
    renderSheet();
    await openSheet();

    fillForm({ name: 'Erik', email: 'not-an-email', password: 'securepassword' });
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  test('shows a validation error for a too-short password', async () => {
    renderSheet();
    await openSheet();

    fillForm({ name: 'Erik', email: 'erik@example.com', password: 'short' });
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  test('calls create with the entered values and the default role', async () => {
    const mockCreate = jest.fn().mockResolvedValue(true);
    jest.mocked(useCreateUser).mockReturnValue({ create: mockCreate, isLoading: false, error: null });

    renderSheet();
    await openSheet();

    fillForm({ name: 'Erik Eriksson', email: 'erik@example.com', password: 'securepassword' });
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

    await waitFor(() => {
      // role defaults to "user" in the form
      expect(mockCreate).toHaveBeenCalledWith(
        'Erik Eriksson',
        'erik@example.com',
        'securepassword',
        'user',
      );
    });
  });

  test('shows an API error message when create fails', async () => {
    jest.mocked(useCreateUser).mockReturnValue({
      create: jest.fn().mockResolvedValue(false),
      isLoading: false,
      error: "A user with email 'erik@example.com' already exists",
    });

    renderSheet();
    await openSheet();

    expect(
      screen.getByText("A user with email 'erik@example.com' already exists"),
    ).toBeInTheDocument();
  });
});
