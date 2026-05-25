/**
 * Tests for the PlaceOrderSheet component.
 * Both useUser (context) and usePlaceOrder (hook) are mocked.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlaceOrderSheet } from './place-order-sheet';
import { Key } from '@/types/key';
import { LockSystem } from '@/types/lock-system';
import { User } from '@/types/user';

jest.mock('@/context/user-context', () => ({
  useUser: jest.fn(),
}));
jest.mock('../hooks/use-orders', () => ({
  usePlaceOrder: jest.fn(),
}));

import { useUser } from '@/context/user-context';
import { usePlaceOrder } from '../hooks/use-orders';

const MOCK_USER: User = {
  id: 'f1a2b3c4-0001-0001-0001-000000000002',
  name: 'Ulf User',
  email: 'ulf@example.com',
  role: 'user',
  assignedLockSystemIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
};

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
    jest.mocked(useUser).mockReturnValue({
      user: MOCK_USER,
      setUserId: jest.fn(),
      demoUsers: [MOCK_USER],
    });
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

  test('shows an API error message when placing the order fails', async () => {
    jest.mocked(usePlaceOrder).mockReturnValue({
      place: jest.fn().mockResolvedValue(false),
      isLoading: false,
      error: 'User is not assigned to this lock system',
    });

    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: /Order/i }));
    await waitFor(() => {
      expect(screen.getByText('User is not assigned to this lock system')).toBeInTheDocument();
    });
  });
});
