/**
 * Tests for the PlaceOrderSheet component.
 * usePlaceOrder is mocked so no real HTTP requests are made.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlaceOrderSheet } from './place-order-sheet';
import { Key } from '@/types/key';
import { LockSystem } from '@/types/lock-system';

jest.mock('../hooks/use-orders', () => ({
  usePlaceOrder: jest.fn(),
}));

import { usePlaceOrder } from '../hooks/use-orders';

const MOCK_KEY: Key = {
  id: 'e1f2a3b4-0001-0001-0001-000000000001',
  label: 'A101',
  description: 'Main Entrance',
  accessLevel: 'Master',
  lockSystemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
};

const MOCK_LOCK_SYSTEM: LockSystem = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  referenceCode: 'SYS-001',
  name: 'Storgatan 12',
  description: 'Main entrance',
};

describe('PlaceOrderSheet', () => {
  beforeEach(() => {
    jest.mocked(usePlaceOrder).mockReturnValue({
      place: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  function renderSheet() {
    return render(<PlaceOrderSheet keyItem={MOCK_KEY} lockSystem={MOCK_LOCK_SYSTEM} />);
  }

  test('renders the Order trigger button', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /Order/i })).toBeInTheDocument();
  });

  test('opens the order form when the trigger is clicked', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => {
      expect(screen.getByText('Order Key')).toBeInTheDocument();
    });
  });

  test('shows the key label and lock system name in the form header', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => {
      expect(screen.getByText(/A101/)).toBeInTheDocument();
      expect(screen.getByText(/Storgatan 12/)).toBeInTheDocument();
    });
  });

  test('does not show the "Please specify" field by default (reason defaults to "lost")', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => screen.getByText('Order Key'));
    expect(screen.queryByLabelText('Please specify')).not.toBeInTheDocument();
  });

  test('submits the order with the entered quantity and default reason', async () => {
    const mockPlace = jest.fn().mockResolvedValue(true);
    jest.mocked(usePlaceOrder).mockReturnValue({
      place: mockPlace,
      isLoading: false,
      error: null,
    });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => screen.getByLabelText('Quantity'));

    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));

    await waitFor(() => {
      // reason defaults to "lost"; reasonDetail is only sent for "other"
      expect(mockPlace).toHaveBeenCalledWith(MOCK_KEY.id, 3, 'lost', undefined);
    });
  });

  test('shows a validation error for a quantity below 1', async () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => screen.getByLabelText('Quantity'));

    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));

    await waitFor(() => {
      expect(screen.getByText('At least 1')).toBeInTheDocument();
    });
  });

  test('shows an API error message when placing the order fails', async () => {
    jest.mocked(usePlaceOrder).mockReturnValue({
      place: jest.fn().mockResolvedValue(false),
      isLoading: false,
      error: 'You are not assigned to this lock system',
    });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => {
      expect(screen.getByText('You are not assigned to this lock system')).toBeInTheDocument();
    });
  });
});
