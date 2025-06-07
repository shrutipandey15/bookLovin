import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach, test, expect } from 'vitest'
import LoginPage from './LoginPage'
import { MemoryRouter } from 'react-router-dom'
import axiosInstance from '@api/axiosInstance'
import { fetchCurrentUser } from '@components/auth'
import { MoodProvider } from '@components/MoodContext'

vi.mock('@components/auth', () => ({
  fetchCurrentUser: vi.fn(),
}))
vi.mock('@api/axiosInstance')

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
})

test('logs in successfully with correct credentials', async () => {
  axiosInstance.post.mockResolvedValueOnce({
    data: { access_token: 'fake-token' }
  })
  fetchCurrentUser.mockResolvedValueOnce({
    name: 'Test User',
    email: 'testuser@example.com',
  })

  renderWithProviders(<LoginPage />)

  const emailInput = screen.getByLabelText(/ravenmail/i)
  const passwordInput = screen.getByLabelText(/secret rune/i)
  const loginButton = screen.getByRole('button', { name: /unlock the tome/i })

  fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } })
  fireEvent.change(passwordInput, { target: { value: 'password123' } })
  fireEvent.click(loginButton)

  await waitFor(() => {
    expect(screen.getByText(/welcome back!/i)).toBeInTheDocument()
    expect(screen.getByText(/successfully logged in as:/i)).toBeInTheDocument()
    expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument()
  }, { timeout: 3000 })
})

test('shows error with incorrect credentials', async () => {
  const mockError = new Error('Request failed with status code 401')
  mockError.response = {
    status: 401,
    data: { detail: 'Invalid email or password.' }
  }

  axiosInstance.post.mockRejectedValueOnce(mockError)

  renderWithProviders(<LoginPage />)

  fireEvent.change(screen.getByLabelText(/ravenmail/i), {
    target: { value: 'wronguser@example.com' },
  })
  fireEvent.change(screen.getByLabelText(/secret rune/i), {
    target: { value: 'wrongpassword' },
  })

  fireEvent.click(screen.getByRole('button', { name: /unlock the tome/i }))

  await waitFor(() =>
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
  )
})
