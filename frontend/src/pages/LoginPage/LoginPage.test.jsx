import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach, test, expect, describe } from 'vitest'
import LoginPage from './LoginPage'
import { MemoryRouter } from 'react-router-dom'
import axiosInstance from '@api/axiosInstance'
import { fetchCurrentUser } from '@components/auth'
import { MoodProvider } from '@components/MoodContext'

// Mock the dependencies
vi.mock('@components/auth', () => ({
  fetchCurrentUser: vi.fn(),
}))

vi.mock('@api/axiosInstance')

vi.mock('@components/MoodContext', () => ({
  MoodProvider: ({ children }) => children,
  useMood: () => ({
    getMoodLabel: () => 'Test Mood'
  })
}))

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <MoodProvider>
        {ui}
      </MoodProvider>
    </MemoryRouter>
  )

beforeEach(() => {
  vi.resetAllMocks()
  // Clear localStorage before each test
  localStorage.clear()
  // Clear any existing timers
  vi.clearAllTimers()
})

describe('LoginPage', () => {
  test('renders login form correctly', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Enter the Realm')).toBeInTheDocument()
    expect(screen.getByLabelText(/ravenmail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/secret rune/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /unlock the tome/i })).toBeInTheDocument()
    expect(screen.getByText(/new to the realm/i)).toBeInTheDocument()
  })

  test('validates email format', async () => {
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/ravenmail/i)
    const passwordInput = screen.getByLabelText(/secret rune/i)
    const loginButton = screen.getByRole('button', { name: /unlock the tome/i })

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  test('validates password length', async () => {
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/ravenmail/i)
    const passwordInput = screen.getByLabelText(/secret rune/i)
    const loginButton = screen.getByRole('button', { name: /unlock the tome/i })

    // Enter valid email but short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be between 8 and 128 characters/i)).toBeInTheDocument()
    })
  })

  test('logs in successfully with correct credentials using FormData', async () => {
    // Mock successful login response
    axiosInstance.post.mockResolvedValueOnce({
      data: { access_token: 'fake-token-12345' }
    })

    // Mock successful user fetch
    fetchCurrentUser.mockResolvedValueOnce({
      id: 1,
      username: 'testuser',
      email: 'testuser@example.com',
    })

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/ravenmail/i)
    const passwordInput = screen.getByLabelText(/secret rune/i)
    const loginButton = screen.getByRole('button', { name: /unlock the tome/i })

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    // Verify the API call was made with FormData
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: expect.any(AbortSignal),
          timeout: 30000,
        })
      )
    })

    // Check that FormData contains correct fields
    const formDataCall = axiosInstance.post.mock.calls[0][1]
    expect(formDataCall).toBeInstanceOf(FormData)

    // Verify success state
    await waitFor(() => {
      expect(screen.getByText(/welcome back!/i)).toBeInTheDocument()
      expect(screen.getByText(/successfully logged in as:/i)).toBeInTheDocument()
      expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument()
    })

    // Verify token was stored
    expect(localStorage.getItem('token')).toBe('fake-token-12345')
  })

  test('shows error with incorrect credentials (401 response)', async () => {
    const mockError = new Error('Request failed with status code 401')
    mockError.response = {
      status: 401,
      data: { detail: 'Incorrect username or password' }
    }

    axiosInstance.post.mockRejectedValueOnce(mockError)

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/ravenmail/i)
    const passwordInput = screen.getByLabelText(/secret rune/i)
    const loginButton = screen.getByRole('button', { name: /unlock the tome/i })

    fireEvent.change(emailInput, { target: { value: 'wronguser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })

    // Verify password field was cleared for security
    expect(passwordInput.value).toBe('')
  })

  test('handles server error (500 response)', async () => {
    const mockError = new Error('Request failed with status code 500')
    mockError.response = {
      status: 500,
      data: { detail: 'Internal server error' }
    }

    axiosInstance.post.mockRejectedValueOnce(mockError)

    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/ravenmail/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/secret rune/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /unlock the tome/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error\. please try again later/i)).toBeInTheDocument()
    })
  })

  test('handles request timeout', async () => {
    const mockError = new Error('timeout of 30000ms exceeded')
    mockError.code = 'ECONNABORTED'

    axiosInstance.post.mockRejectedValueOnce(mockError)

    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/ravenmail/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/secret rune/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /unlock the tome/i }))

    await waitFor(() => {
      expect(screen.getByText(/request timed out/i)).toBeInTheDocument()
    })
  })

  test('toggles password visibility', () => {
    renderWithProviders(<LoginPage />)

    const passwordInput = screen.getByLabelText(/secret rune/i)
    const toggleButton = screen.getByLabelText(/show password/i)

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password')

    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    // Click to hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  test('disables form when blocked due to rate limiting', async () => {
    // Set up localStorage to simulate blocked state
    const blockEnd = new Date(Date.now() + 900000) // 15 minutes from now
    localStorage.setItem('loginBlockEnd', blockEnd.toISOString())
    localStorage.setItem('loginAttempts', '5')

    renderWithProviders(<LoginPage />)

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/ravenmail/i)
      const passwordInput = screen.getByLabelText(/secret rune/i)
      const loginButton = screen.getByRole('button', { name: /unlock the tome/i })

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(loginButton).toBeDisabled()
      expect(screen.getByText(/account temporarily blocked/i)).toBeInTheDocument()
    })
  })

  test('shows logout button and handles logout when logged in', async () => {
    // Mock existing token
    localStorage.setItem('token', 'existing-token')

    fetchCurrentUser.mockResolvedValueOnce({
      id: 1,
      username: 'testuser',
      email: 'testuser@example.com',
    })

    renderWithProviders(<LoginPage />)

    await waitFor(() => {
      expect(screen.getByText(/welcome back!/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    // Click logout
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    // Should return to login form
    await waitFor(() => {
      expect(screen.getByText('Enter the Realm')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /unlock the tome/i })).toBeInTheDocument()
    })

    // Token should be removed
    expect(localStorage.getItem('token')).toBeNull()
  })

  test('displays current mood label when logged in', async () => {
    localStorage.setItem('token', 'existing-token')

    fetchCurrentUser.mockResolvedValueOnce({
      id: 1,
      username: 'testuser',
      email: 'testuser@example.com',
    })

    renderWithProviders(<LoginPage />)

    await waitFor(() => {
      expect(screen.getByText(/current mood: test mood/i)).toBeInTheDocument()
    })
  })

  test('shows loading state during login', async () => {
    // Create a promise that we can control
    let resolvePromise
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    axiosInstance.post.mockReturnValueOnce(controlledPromise)

    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/ravenmail/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/secret rune/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /unlock the tome/i }))

    // Should show loading state
    expect(screen.getByText(/opening scrolls\.\.\./i)).toBeInTheDocument()

    // Resolve the promise to complete the test
    resolvePromise({
      data: { access_token: 'test-token' }
    })
  })
})
