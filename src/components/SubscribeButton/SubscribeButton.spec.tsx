import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import { getStripeJs } from 'services/stripe-js';
import { api } from 'services/api';

import { SubscribeButton } from '.';

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('services/api');
jest.mock('services/stripe-js');

describe('SubscribeButton component', () => {
  it('should be rendered in the document', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('should redirect to sign in when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession);
    const signInMocked = mocked(signIn);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it('should redirect to posts when user already has a subscription', () => {
    const useRouterMocked = mocked(useRouter);
    const useSessionMocked = mocked(useSession);

    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: 'John Doe' },
        expires: '',
        activeSubscription: true,
      } as any,
      false,
    ]);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith('/posts');
  });

  it('should redirect to checkout when user does not have a subscription', async () => {
    const useSessionMocked = mocked(useSession);
    const apiPostMocked = mocked(api.post);
    const getStripeJsMocked = mocked(getStripeJs);

    const redirectToCheckoutMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: 'John Doe' },
        expires: '',
        activeSubscription: false,
      } as any,
      false,
    ]);

    apiPostMocked.mockResolvedValueOnce({
      data: {
        sessionId: 'fake-session-id',
      },
    });

    getStripeJsMocked.mockResolvedValueOnce({
      redirectToCheckout: redirectToCheckoutMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(apiPostMocked).toHaveBeenCalledWith('subscribe');
    await waitFor(() => {
      expect(redirectToCheckoutMock).toHaveBeenCalledWith({
        sessionId: 'fake-session-id',
      });
    });
  });

  it('should show an alert if an error occurs on subscription', async () => {
    const useSessionMocked = mocked(useSession);
    const apiPostMocked = mocked(api.post);
    const useRouterMocked = mocked(useRouter);

    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: 'John Doe' },
        expires: '',
        activeSubscription: false,
      } as any,
      false,
    ]);

    apiPostMocked.mockImplementation(() => {
      throw new Error();
    });

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
