import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';
import RegistrationPage from './RegistrationPage';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '@api/axiosInstance';

// Mock dependencies
vi.mock('@api/axiosInstance');

// Create a persistent mock function for navigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

describe('RegistrationPage', () => {
  test('renders registration form correctly', () => { /* ... */ });
  test('validates form inputs', async () => { /* ... */ });
  test('shows password strength indicator and toggles visibility', () => { /* ... */ });


  test('handles successful registration', async () => {
    vi.useFakeTimers();
    axiosInstance.post.mockResolvedValueOnce({ data: null });

    renderWithProviders(<RegistrationPage />);

    fireEvent.change(screen.getByLabelText(/pen name/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/ravenmail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^secret rune$/i), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirm secret rune/i), { target: { value: 'ValidPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/your legend begins, testuser!/i)).toBeInTheDocument();
    expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/register',
        { username: 'testuser', email: 'test@example.com', password: 'ValidPass123!' },
        expect.any(Object)
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Registration successful! Please log in with your credentials.' },
    });

    vi.useRealTimers();
  });

  test('handles registration errors', async () => {
    const existingUserError = new Error('Request failed with status code 409');
    existingUserError.response = { status: 409, data: { detail: 'User already exists' } };
    axiosInstance.post.mockRejectedValueOnce(existingUserError);

    renderWithProviders(<RegistrationPage />);

    fireEvent.change(screen.getByLabelText(/pen name/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/ravenmail/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^secret rune$/i), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirm secret rune/i), { target: { value: 'ValidPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }));

    // Use findBy* which waits for the element to appear after an async update
    const errorMessage = await screen.findByText(/username or email already exists/i);
    expect(errorMessage).toBeInTheDocument();

    expect(screen.getByLabelText(/^secret rune$/i).value).toBe('');
    expect(screen.getByLabelText(/confirm secret rune/i).value).toBe('');
  });

  test('handles UserError responses', async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { error_code: 'ALREADY_EXISTS', details: 'User already exists' },
    });

    renderWithProviders(<RegistrationPage />);

    fireEvent.change(screen.getByLabelText(/pen name/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/ravenmail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^secret rune$/i), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirm secret rune/i), { target: { value: 'ValidPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }));

    const errorMessage = await screen.findByText(/a tale with that pen name or ravenmail already exists/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('shows loading state and prevents multiple submissions', async () => {
    let resolvePromise;
    const controlledPromise = new Promise((resolve) => { resolvePromise = resolve; });
    axiosInstance.post.mockReturnValueOnce(controlledPromise);

    renderWithProviders(<RegistrationPage />);

    fireEvent.change(screen.getByLabelText(/pen name/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/ravenmail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^secret rune$/i), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirm secret rune/i), { target: { value: 'ValidPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }));

    // Wait for the loading state to appear
    expect(await screen.findByText(/inscribing\.\.\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pen name/i)).toBeDisabled();

    await act(async () => {
        resolvePromise({ data: null });
    });
  });

  test('handles rate limiting and blocking', async () => {
    const blockEnd = new Date(Date.now() + 180000);
    localStorage.setItem('registrationBlockEnd', blockEnd.toISOString());
    localStorage.setItem('registrationAttempts', '100');

    renderWithProviders(<RegistrationPage />);

    expect(await screen.findByText(/registration temporarily blocked/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pen name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /scribe me in/i })).toBeDisabled();
  });

  // test('sanitizes input data', async () => {
  //   axiosInstance.post.mockResolvedValueOnce({ data: null });

  //   renderWithProviders(<RegistrationPage />);

  //   const rawUsername = '  testuser<>  ';
  //   const rawEmail = '  TEST@EXAMPLE.COM<>  ';

  //   fireEvent.change(screen.getByLabelText(/pen name/i), { target: { value: rawUsername } });
  //   fireEvent.change(screen.getByLabelText(/ravenmail/i), { target: { value: rawEmail } });
  //   fireEvent.change(screen.getByLabelText(/^secret rune$/i), { target: { value: 'ValidPass123!' } });
  //   fireEvent.change(screen.getByLabelText(/confirm secret rune/i), { target: { value: 'ValidPass123!' } });
  //   fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }));

  //   // Use waitFor to check the mock's arguments after the async submission
  //   await waitFor(() => {
  //     expect(axiosInstance.post).toHaveBeenCalledWith(
  //       '/auth/register',
  //       {
  //         username: rawUsername,
  //         email: rawEmail,
  //         password: 'ValidPass1s23!',
  //       },
  //       expect.any(Object)
  //     );
  //   });
  // });
});
