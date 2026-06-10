/**
 * Tests for the AdminRoute guard and the presentational lock-system
 * components (the latter are pure – they only render props and do not
 * call the API).
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './App';
import { useAuth } from '@/features/auth/context/auth-context';
import { LockSystemCard } from './features/lock-systems/components/lock-system-card';
import { LockSystemList } from './features/lock-systems/components/lock-system-list';
import { LockSystem } from './types/lock-system';
import { User } from './types/user';

jest.mock('@/features/auth/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

const SYSTEM: LockSystem = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  referenceCode: 'SYS-001',
  name: 'Storgatan 12',
  description: 'Main entrance',
};

/** Wrap a component in a MemoryRouter so that <Link> works in tests. */
function withRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// ---------------------------------------------------------------------------
// AdminRoute
// ---------------------------------------------------------------------------

const ADMIN: User = {
  id: '1',
  name: 'Alice Admin',
  email: 'alice@example.com',
  role: 'admin',
  assignedLockSystemIds: [],
};

const REGULAR_USER: User = {
  id: '2',
  name: 'Ulf User',
  email: 'ulf@example.com',
  role: 'user',
  assignedLockSystemIds: [],
};

/** Mounts AdminRoute on /users next to a stub home route to observe redirects. */
function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/users']}>
      <Routes>
        <Route
          path="/users"
          element={
            <AdminRoute>
              <div>admin only content</div>
            </AdminRoute>
          }
        />
        <Route path="/lock-systems" element={<div>home page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  test('renders its children for an admin', () => {
    jest.mocked(useAuth).mockReturnValue({
      user: ADMIN,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    renderAdminRoute();
    expect(screen.getByText('admin only content')).toBeInTheDocument();
  });

  test('redirects a regular user to the start page', () => {
    jest.mocked(useAuth).mockReturnValue({
      user: REGULAR_USER,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    renderAdminRoute();
    expect(screen.queryByText('admin only content')).not.toBeInTheDocument();
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  test('renders nothing while the session check is loading', () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
    });
    const { container } = renderAdminRoute();
    expect(container).toBeEmptyDOMElement();
  });
});

// ---------------------------------------------------------------------------
// LockSystemCard
// ---------------------------------------------------------------------------

describe('LockSystemCard', () => {
  test('renders the lock system name', () => {
    withRouter(<LockSystemCard lockSystem={SYSTEM} />);
    expect(screen.getByText('Storgatan 12')).toBeInTheDocument();
  });

  test('renders the reference code and description', () => {
    withRouter(<LockSystemCard lockSystem={SYSTEM} />);
    expect(screen.getByText(/SYS-001/)).toBeInTheDocument();
    expect(screen.getByText(/Main entrance/)).toBeInTheDocument();
  });

  test('links to the lock system detail page', () => {
    withRouter(<LockSystemCard lockSystem={SYSTEM} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/lock-systems/SYS-001');
  });
});

// ---------------------------------------------------------------------------
// LockSystemList
// ---------------------------------------------------------------------------

describe('LockSystemList', () => {
  test('renders each lock system by name', () => {
    const systems: LockSystem[] = [
      { id: '1', referenceCode: 'SYS-001', name: 'Building A', description: 'Desc A' },
      { id: '2', referenceCode: 'SYS-002', name: 'Building B', description: 'Desc B' },
    ];
    withRouter(<LockSystemList lockSystems={systems} />);
    expect(screen.getByText('Building A')).toBeInTheDocument();
    expect(screen.getByText('Building B')).toBeInTheDocument();
  });

  test('renders nothing when the list is empty', () => {
    const { container } = withRouter(<LockSystemList lockSystems={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
