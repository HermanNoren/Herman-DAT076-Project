/**
 * Tests for AdminOrderList and UserOrderList.
 * Both render pre-joined OrderRow data; useUpdateOrderStatus is mocked.
 * (The status Select interaction itself is not exercised — Radix Select
 * does not work in jsdom — its API behavior is covered by the server tests.)
 */
import { render, screen } from '@testing-library/react';
import { AdminOrderList } from './admin-order-list';
import { UserOrderList } from './user-order-list';
import { OrderRow } from '../hooks/use-order-rows';

jest.mock('../hooks/use-orders', () => ({
  useUpdateOrderStatus: jest.fn(),
}));

import { useUpdateOrderStatus } from '../hooks/use-orders';

const ROW: OrderRow = {
  order: {
    id: 'o1',
    userId: 'u1',
    keyId: 'k1',
    quantity: 2,
    reason: 'additional_copy',
    status: 'placed',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  keyLabel: 'A101',
  lockSystemCode: 'SYS-001',
  userName: 'Ulf User',
};

const OTHER_ROW: OrderRow = {
  ...ROW,
  order: {
    ...ROW.order,
    id: 'o2',
    reason: 'other',
    reasonDetail: 'Spare for the janitor',
    status: 'ready',
  },
};

describe('AdminOrderList', () => {
  beforeEach(() => {
    jest.mocked(useUpdateOrderStatus).mockReturnValue({
      updateStatus: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  test('renders user, key, system, quantity and reason for each row', () => {
    render(<AdminOrderList rows={[ROW]} onStatusChanged={jest.fn()} />);
    expect(screen.getByText('Ulf User')).toBeInTheDocument();
    expect(screen.getByText('A101')).toBeInTheDocument();
    expect(screen.getByText('SYS-001')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Additional copy')).toBeInTheDocument();
  });

  test('shows the reason detail for "other" orders', () => {
    render(<AdminOrderList rows={[OTHER_ROW]} onStatusChanged={jest.fn()} />);
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Spare for the janitor')).toBeInTheDocument();
  });

  test('renders a status select with the current status', () => {
    render(<AdminOrderList rows={[ROW]} onStatusChanged={jest.fn()} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Placed');
  });

  test('shows an empty state when there are no orders', () => {
    render(<AdminOrderList rows={[]} onStatusChanged={jest.fn()} />);
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });
});

describe('UserOrderList', () => {
  test('renders key, system, quantity, reason and a status badge', () => {
    render(<UserOrderList rows={[ROW]} />);
    expect(screen.getByText('A101')).toBeInTheDocument();
    expect(screen.getByText('SYS-001')).toBeInTheDocument();
    expect(screen.getByText('Additional copy')).toBeInTheDocument();
    expect(screen.getByText('Placed')).toBeInTheDocument();
    // no user column in the user view
    expect(screen.queryByText('Ulf User')).not.toBeInTheDocument();
  });

  test('shows the readable status label', () => {
    render(<UserOrderList rows={[OTHER_ROW]} />);
    expect(screen.getByText('Ready for pickup')).toBeInTheDocument();
  });

  test('shows an empty state when there are no orders', () => {
    render(<UserOrderList rows={[]} />);
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });
});
