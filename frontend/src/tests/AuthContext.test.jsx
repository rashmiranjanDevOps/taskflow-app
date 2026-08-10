import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders its children when no access token exists', () => {
    render(
      <AuthProvider>
        <div>Taskflow Application</div>
      </AuthProvider>
    );

    expect(screen.getByText('Taskflow Application')).toBeInTheDocument();
  });
});
