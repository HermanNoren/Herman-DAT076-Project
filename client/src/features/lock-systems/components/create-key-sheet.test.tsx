/**
 * Tests for the CreateKeySheet component.
 * The useCreateKey hook is mocked so tests are fully isolated from the API.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateKeySheet } from './create-key-sheet';

jest.mock('../hooks/use-lock-systems', () => ({
  useCreateKey: jest.fn(),
}));

import { useCreateKey } from '../hooks/use-lock-systems';

const LOCK_SYSTEM_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

function renderSheet(onCreated = jest.fn()) {
  return render(<CreateKeySheet lockSystemId={LOCK_SYSTEM_ID} onCreated={onCreated} />);
}

describe('CreateKeySheet', () => {
  beforeEach(() => {
    jest.mocked(useCreateKey).mockReturnValue({
      create: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  test('renders the "Add Key" trigger button', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /Add Key/i })).toBeInTheDocument();
  });

  test('opens the form when the trigger button is clicked', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Key/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Key/i })).toBeInTheDocument();
    });
  });

  test('shows a validation error when the form is submitted with empty fields', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Key/i }));
    await waitFor(() => screen.getByRole('button', { name: /Create Key/i }));

    fireEvent.click(screen.getByRole('button', { name: /Create Key/i }));

    await waitFor(() => {
      expect(screen.getByText('Label is required')).toBeInTheDocument();
    });
  });

  test('calls create with the entered values and the default access level', async () => {
    const mockCreate = jest.fn().mockResolvedValue(true);
    jest.mocked(useCreateKey).mockReturnValue({ create: mockCreate, isLoading: false, error: null });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Key/i }));
    await waitFor(() => screen.getByLabelText('Label'));

    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'B201' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Basement door' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Key/i }));

    await waitFor(() => {
      // accessLevel defaults to "Individual" in the form
      expect(mockCreate).toHaveBeenCalledWith('B201', 'Basement door', 'Individual', LOCK_SYSTEM_ID);
    });
  });

  test('calls onCreated and closes the sheet after a successful create', async () => {
    const onCreated = jest.fn();
    renderSheet(onCreated);

    fireEvent.click(screen.getByRole('button', { name: /Add Key/i }));
    await waitFor(() => screen.getByLabelText('Label'));

    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'B202' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Attic' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Key/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });

  test('shows an API error message when create fails', async () => {
    jest.mocked(useCreateKey).mockReturnValue({
      create: jest.fn().mockResolvedValue(false),
      isLoading: false,
      error: "A key with label 'B201' already exists in this lock system",
    });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Add Key/i }));
    await waitFor(() => {
      expect(
        screen.getByText("A key with label 'B201' already exists in this lock system"),
      ).toBeInTheDocument();
    });
  });
});
