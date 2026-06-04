/**
 * Tests for RegularUserList and AdminList.
 * The user hooks are mocked; AssignLockSystemSheet renders inside the list so
 * its hooks are mocked too.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegularUserList, AdminList } from './user-list';
import { User } from '@/types/user';
import { LockSystem } from '@/types/lock-system';

jest.mock('../hooks/use-users', () => ({
  useDeleteUser: jest.fn(),
  useAssignLockSystem: jest.fn(),
  useUnassignLockSystem: jest.fn(),
}));

import {
  useDeleteUser,
  useAssignLockSystem,
  useUnassignLockSystem,
} from '../hooks/use-users';

const SYSTEM: LockSystem = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  referenceCode: 'SYS-001',
  name: 'Storgatan 12',
  description: 'Main entrance',
};

const ULF: User = {
  id: 'f1a2b3c4-0001-0001-0001-000000000002',
  name: 'Ulf User',
  email: 'ulf@example.com',
  role: 'user',
  assignedLockSystemIds: [SYSTEM.id],
};

describe('RegularUserList', () => {
  beforeEach(() => {
    jest.mocked(useDeleteUser).mockReturnValue({
      remove: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
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

  function renderList(users: User[] = [ULF], onDeleted = jest.fn()) {
    return render(
      <RegularUserList
        users={users}
        lockSystems={[SYSTEM]}
        onAssigned={jest.fn()}
        onDeleted={onDeleted}
      />,
    );
  }

  test('renders the user name, email and assigned system count', () => {
    renderList();
    expect(screen.getByText('Ulf User')).toBeInTheDocument();
    expect(screen.getByText('ulf@example.com')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // one assigned system
  });

  test('shows an empty state when there are no users', () => {
    renderList([]);
    expect(screen.getByText('No users')).toBeInTheDocument();
  });

  test('deleting a user calls remove with the user id and then onDeleted', async () => {
    const mockRemove = jest.fn().mockResolvedValue(true);
    jest.mocked(useDeleteUser).mockReturnValue({
      remove: mockRemove,
      isLoading: false,
      error: null,
    });
    const onDeleted = jest.fn();
    renderList([ULF], onDeleted);

    fireEvent.click(screen.getByRole('button', { name: 'Delete Ulf User' }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(ULF.id);
      expect(onDeleted).toHaveBeenCalled();
    });
  });

  test('does not call onDeleted when the delete request fails', async () => {
    const mockRemove = jest.fn().mockResolvedValue(false);
    jest.mocked(useDeleteUser).mockReturnValue({
      remove: mockRemove,
      isLoading: false,
      error: 'Admin accounts cannot be deleted',
    });
    const onDeleted = jest.fn();
    renderList([ULF], onDeleted);

    fireEvent.click(screen.getByRole('button', { name: 'Delete Ulf User' }));

    await waitFor(() => expect(mockRemove).toHaveBeenCalled());
    expect(onDeleted).not.toHaveBeenCalled();
  });
});

describe('AdminList', () => {
  const ALICE: User = {
    id: 'f1a2b3c4-0001-0001-0001-000000000001',
    name: 'Alice Admin',
    email: 'alice@example.com',
    role: 'admin',
    assignedLockSystemIds: [],
  };

  test('renders the admin name and email', () => {
    render(<AdminList admins={[ALICE]} />);
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  test('shows an empty state when there are no admins', () => {
    render(<AdminList admins={[]} />);
    expect(screen.getByText('No admins')).toBeInTheDocument();
  });
});
