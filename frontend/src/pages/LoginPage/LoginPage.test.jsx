import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import LoginPage from './LoginPage'
import { MemoryRouter } from 'react-router-dom'

const originalFetch = global.fetch
global.fetch = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
})

afterAll(() => {
  global.fetch = originalFetch
})

test('logs in successfully with correct credentials', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'fake-token' })
  })

  const { container } = render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>)

  const emailInput = screen.getByLabelText(/email/i)
  const passwordInput = screen.getByLabelText(/password/i)
  const loginButton = screen.getByRole('button', { name: /login/i })

  fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } })
  fireEvent.change(passwordInput, { target: { value: 'password123' } })
  fireEvent.click(loginButton)

  await waitFor(() => {
    expect(screen.getByText(/welcome back, testuser@example.com/i)).toBeInTheDocument()
  }, { timeout: 3000 })
})

test('shows error with incorrect credentials', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ detail: 'Incorrect username or password' })
  })

  render(
  <MemoryRouter>
    <LoginPage />
    </MemoryRouter>)

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'wronguser@example.com' },
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'wrongpassword' },
  })

  fireEvent.click(screen.getByRole('button', { name: /login/i }))

  await waitFor(() =>
    expect(screen.getByText(/incorrect username or password/i)).toBeInTheDocument()
  )
})
