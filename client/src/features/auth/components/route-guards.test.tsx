/**
 * Tests for the ProtectedRoute and AdminRoute guards. The auth context is
 * mocked; routing is exercised with a MemoryRouter and stub pages so the
 * redirects can be observed.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './route-guards';
import { useAuth } from '../context/auth-context';
import { User } from '@/types/user';

jest.mock('../context/auth-context', () => ({
  useAuth: jest.fn(),
}));

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

function mockAuth(user: User | null, isLoading = false) {
  jest.mocked(useAuth).mockReturnValue({
    user,
    isLoading,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

/** Mounts ProtectedRoute on /orders next to a stub login page to observe redirects. */
function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/orders']}>
      <Routes>
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

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

describe('ProtectedRoute', () => {
  test('renders its children for a logged-in user', () => {
    mockAuth(REGULAR_USER);
    renderProtectedRoute();
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  test('redirects to the login page when logged out', () => {
    mockAuth(null);
    renderProtectedRoute();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  test('renders nothing while the session check is loading', () => {
    mockAuth(null, true);
    const { container } = renderProtectedRoute();
    expect(container).toBeEmptyDOMElement();
  });
});

describe('AdminRoute', () => {
  test('renders its children for an admin', () => {
    mockAuth(ADMIN);
    renderAdminRoute();
    expect(screen.getByText('admin only content')).toBeInTheDocument();
  });

  test('redirects a regular user to the start page', () => {
    mockAuth(REGULAR_USER);
    renderAdminRoute();
    expect(screen.queryByText('admin only content')).not.toBeInTheDocument();
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  test('renders nothing while the session check is loading', () => {
    mockAuth(null, true);
    const { container } = renderAdminRoute();
    expect(container).toBeEmptyDOMElement();
  });
});
