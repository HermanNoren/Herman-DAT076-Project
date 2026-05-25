/**
 * Tests for the presentational lock-system components.
 * These components are pure – they only render props and do not call the API.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LockSystemCard } from './features/lock-systems/components/lock-system-card';
import { LockSystemList } from './features/lock-systems/components/lock-system-list';
import { LockSystem } from './types/lock-system';

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
