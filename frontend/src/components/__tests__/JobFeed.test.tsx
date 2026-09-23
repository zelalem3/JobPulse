

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobFeed } from '../home/JobFeed';
import '@testing-library/jest-dom';

const mockJobs = [
  { id: '1', title: 'Laravel Developer', company: 'Acme Inc', location: 'Remote' },
  { id: '2', title: 'React Frontend Engineer', company: 'Globex', location: 'Addis Ababa' },
];

describe('JobFeed Component', () => {
  it('renders list of jobs and filters by search input', async () => {
    render();

    // Verify initial render
    expect(screen.getByText('Laravel Developer')).toBeInTheDocument();
    expect(screen.getByText('React Frontend Engineer')).toBeInTheDocument();

    // Type into search bar
    const searchInput = screen.getByPlaceholderText(/search jobs, skills, or companies/i);
    fireEvent.change(searchInput, { target: { value: 'Laravel' } });

    // Assert filtered state
    await waitFor(() => {
      expect(screen.getByText('Laravel Developer')).toBeInTheDocument();
      expect(screen.queryByText('React Frontend Engineer')).not.toBeInTheDocument();
    });
  });
});