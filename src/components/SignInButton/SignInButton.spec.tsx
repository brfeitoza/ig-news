import { fireEvent, render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { signIn, signOut, useSession } from 'next-auth/client';

import { SignInButton } from '.';

jest.mock('next-auth/client');

describe('SignInButton component', () => {
  it('should be rendered correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
  });

  it('should be rendered correctly when user is authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([
      { user: { name: 'John Doe' }, expires: '' },
      false,
    ]);

    render(<SignInButton />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call the signIn function when clicked and user is not authenticated', () => {
    const useSessionMocked = mocked(useSession);
    const signInMocked = mocked(signIn);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    const signInButton = screen.getByText('Sign in with GitHub');

    fireEvent.click(signInButton);

    expect(signInMocked).toHaveBeenCalledWith('github');
  });

  it('should call the signOut function when clicked and user is authenticated', () => {
    const useSessionMocked = mocked(useSession);
    const signOutMocked = mocked(signOut);

    useSessionMocked.mockReturnValueOnce([
      { user: { name: 'John Doe' }, expires: '' },
      false,
    ]);

    render(<SignInButton />);

    const signInButton = screen.getByText('John Doe');

    fireEvent.click(signInButton);

    expect(signOutMocked).toHaveBeenCalled();
  });
});
