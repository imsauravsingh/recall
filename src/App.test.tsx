import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders dashboard navigation', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Developer memory workspace/i)).toBeInTheDocument();
  expect(screen.getByText(/Total topics/i)).toBeInTheDocument();
  expect(screen.getByText(/Your current study baseline/i)).toBeInTheDocument();
});
