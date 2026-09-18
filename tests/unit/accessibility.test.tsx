import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorState from '../../src/components/common/ErrorState';
import EmptyState from '../../src/components/common/EmptyState';

describe('Component Accessibility & Keyboard Focus States', () => {
  it('renders ErrorState with alert role and retry button accessibility', () => {
    const onRetry = () => {};
    render(<ErrorState message="Failed to load workforce analytics" onRetry={onRetry} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeDefined();

    const button = screen.getByRole('button', { name: /retry/i });
    expect(button).toBeDefined();
  });

  it('renders EmptyState with title and description message', () => {
    render(<EmptyState title="No Records Found" description="Try adjusting your filter criteria." />);

    const emptyTitle = screen.getByText('No Records Found');
    expect(emptyTitle).toBeDefined();

    const emptyMessage = screen.getByText('Try adjusting your filter criteria.');
    expect(emptyMessage).toBeDefined();
  });
});
