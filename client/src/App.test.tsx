import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, beforeAll, afterEach, afterAll, vi } from 'vitest'
import App from './App';

const server = setupServer(
  rest.post('http://localhost:5000/login', (req, res, ctx) => {
    return res(ctx.json({access_token: 'hello there'}))
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('render App comp', async () => {
  const { getByText, getByTestId } = render(<App />);
  const linkElement = getByText(/Copyright/i);
  expect(linkElement).toBeInTheDocument();
  expect(getByText('ETL Sign in')).toBeInTheDocument();

  const user = getByTestId("userInput");
  const pass = getByTestId("passwordInput")
  const signButton = getByTestId("signButton")

  expect(user).toBeInTheDocument()
  expect(pass).toBeInTheDocument()
  expect(signButton).toBeInTheDocument()

  fireEvent.change(user, {
    target: { value: "admin" },
  });

  fireEvent.change(pass, {
    target: { value: "admin" },
  });

  fireEvent.click(signButton);

  // wait for the word Menu to show in the html
  const menuText = await waitFor(() => getByText('Job Runner')) 
  expect(menuText).toBeInTheDocument();
});
