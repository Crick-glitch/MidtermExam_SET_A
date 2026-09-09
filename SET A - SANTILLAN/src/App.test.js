import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the scheduled task manager', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /my scheduled tasks/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register task/i })).toBeInTheDocument();
});
