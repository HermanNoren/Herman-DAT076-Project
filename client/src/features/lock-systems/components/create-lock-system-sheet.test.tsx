/**
 * Tests for the CreateLockSystemSheet component.
 * The useCreateLockSystem hook is mocked so tests are fully isolated from the API.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreateLockSystemSheet } from './create-lock-system-sheet';

jest.mock('../hooks/use-lock-systems', () => ({
  useCreateLockSystem: jest.fn(),
}));

import { useCreateLockSystem } from '../hooks/use-lock-systems';

function renderSheet(onCreated = jest.fn()) {
  return render(
    <MemoryRouter>
      <CreateLockSystemSheet onCreated={onCreated} />
    </MemoryRouter>,
  );
}

describe('CreateLockSystemSheet', () => {
  beforeEach(() => {
    jest.mocked(useCreateLockSystem).mockReturnValue({
      create: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  test('renders the "Add Lock System" trigger button', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /Add Lock System/i })).toBeInTheDocument();
  });

  test('opens the form when the trigger button is clicked', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Lock System/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Lock System/i })).toBeInTheDocument();
    });
  });

  test('shows a validation error when the form is submitted with empty fields', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Lock System/i }));
    await waitFor(() => screen.getByRole('button', { name: /Create Lock System/i }));

    fireEvent.click(screen.getByRole('button', { name: /Create Lock System/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  test('calls create with the entered name and description on valid submit', async () => {
    const mockCreate = jest.fn().mockResolvedValue(true);
    jest.mocked(useCreateLockSystem).mockReturnValue({ create: mockCreate, isLoading: false, error: null });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Lock System/i }));
    await waitFor(() => screen.getByLabelText('Name'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Building' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Ground floor' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Lock System/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('Test Building', 'Ground floor');
    });
  });

  test('shows an API error message when create returns an error', async () => {
    jest.mocked(useCreateLockSystem).mockReturnValue({
      create: jest.fn().mockResolvedValue(false),
      isLoading: false,
      error: 'Server is unavailable',
    });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Lock System/i }));
    await waitFor(() => {
      expect(screen.getByText('Server is unavailable')).toBeInTheDocument();
    });
  });
});
