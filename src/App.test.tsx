import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders dashboard navigation', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Good morning, Saurav/i)).toBeInTheDocument();
  expect(screen.getByText(/Total topics/i)).toBeInTheDocument();
  expect(screen.getByText(/Interview rounds overview/i)).toBeInTheDocument();
});
