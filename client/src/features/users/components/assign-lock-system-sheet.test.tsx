/**
 * Tests for the AssignLockSystemSheet component.
 * useAssignLockSystem and useUnassignLockSystem are mocked.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssignLockSystemSheet } from './assign-lock-system-sheet';
import { User } from '@/types/user';
import { LockSystem } from '@/types/lock-system';

jest.mock('../hooks/use-users', () => ({
  useAssignLockSystem: jest.fn(),
  useUnassignLockSystem: jest.fn(),
}));

import { useAssignLockSystem, useUnassignLockSystem } from '../hooks/use-users';

const SYS_1: LockSystem = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  referenceCode: 'SYS-001',
  name: 'Storgatan 12',
  description: 'Main entrance',
};

const SYS_2: LockSystem = {
  id: 'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22',
  referenceCode: 'SYS-002',
  name: 'Nygatan 8',
  description: 'Master System',
};

// Ulf is assigned to SYS-001 but not SYS-002
const ULF: User = {
  id: 'f1a2b3c4-0001-0001-0001-000000000002',
  name: 'Ulf User',
  email: 'ulf@example.com',
  role: 'user',
  assignedLockSystemIds: [SYS_1.id],
};

describe('AssignLockSystemSheet', () => {
  beforeEach(() => {
    jest.mocked(useAssignLockSystem).mockReturnValue({
      assign: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
    jest.mocked(useUnassignLockSystem).mockReturnValue({
      unassign: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
  });

  function renderSheet(lockSystems: LockSystem[] = [SYS_1, SYS_2], onAssigned = jest.fn()) {
    return render(
      <AssignLockSystemSheet user={ULF} lockSystems={lockSystems} onAssigned={onAssigned} />,
    );
  }

  async function openSheet() {
    fireEvent.click(screen.getByRole('button', { name: /Manage lock systems for Ulf User/i }));
    await waitFor(() => screen.getByText('Assign Lock Systems'));
  }

  test('opens and lists the lock systems with their assignment state', async () => {
    renderSheet();
    await openSheet();

    expect(screen.getByText('Storgatan 12')).toBeInTheDocument();
    expect(screen.getByText('Nygatan 8')).toBeInTheDocument();
    // SYS-001 is assigned → Unassign; SYS-002 is not → Assign
    expect(screen.getByRole('button', { name: 'Unassign' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
  });

  test('shows an empty state when there are no lock systems', async () => {
    renderSheet([]);
    await openSheet();

    expect(screen.getByText('No lock systems available')).toBeInTheDocument();
  });

  test('clicking Assign calls assign with the user and system ids', async () => {
    const mockAssign = jest.fn().mockResolvedValue(true);
    jest.mocked(useAssignLockSystem).mockReturnValue({
      assign: mockAssign,
      isLoading: false,
      error: null,
    });
    const onAssigned = jest.fn();
    renderSheet([SYS_1, SYS_2], onAssigned);
    await openSheet();

    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith(ULF.id, SYS_2.id);
      expect(onAssigned).toHaveBeenCalled();
    });
  });

  test('clicking Unassign calls unassign and flips the button to Assign', async () => {
    const mockUnassign = jest.fn().mockResolvedValue(true);
    jest.mocked(useUnassignLockSystem).mockReturnValue({
      unassign: mockUnassign,
      isLoading: false,
      error: null,
    });
    renderSheet();
    await openSheet();

    fireEvent.click(screen.getByRole('button', { name: 'Unassign' }));

    await waitFor(() => {
      expect(mockUnassign).toHaveBeenCalledWith(ULF.id, SYS_1.id);
      // both systems are now unassigned → two Assign buttons, no Unassign
      expect(screen.getAllByRole('button', { name: 'Assign' })).toHaveLength(2);
      expect(screen.queryByRole('button', { name: 'Unassign' })).not.toBeInTheDocument();
    });
  });
});
