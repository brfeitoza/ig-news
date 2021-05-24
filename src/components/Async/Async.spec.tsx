import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Async } from '.';

it('should be rendered in the document', async () => {
  render(<Async />);

  expect(screen.getByText('Hello World')).toBeInTheDocument();

  await waitForElementToBeRemoved(screen.queryByText('Button'));

  // await waitFor(() => {
  //   return expect(screen.queryByText('Button')).not.toBeInTheDocument();
  // });

  // await waitFor(() => {
  //   return expect(screen.getByText('Button')).toBeInTheDocument();
  // });

  // expect(await screen.findByText('Button', {}, { timeout: 5000 })).toBeInTheDocument();
})
