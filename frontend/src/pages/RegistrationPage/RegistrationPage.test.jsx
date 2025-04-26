import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'
import RegistrationPage from './RegistrationPage'

const originalFetch = global.fetch
global.fetch = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
})

afterAll(() => {
  global.fetch = originalFetch
})

// Helper function to fill form inputs
const fillRegistrationForm = ({ username, email, password }) => {
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: username },
  })
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  })
}

test('registers successfully with correct details', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: 'some-user-id', message: 'Registration successful' }),
  })

  render(
    <MemoryRouter>
      <RegistrationPage />
    </MemoryRouter>
  )

  fillRegistrationForm({
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'newpassword123',
  })

  fireEvent.click(screen.getByRole('button', { name: /register/i }))

  await waitFor(() =>
    expect(screen.getByText(/registration successful! welcome/i)).toBeInTheDocument()
  )
})

test('shows error with invalid details', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ detail: 'Email already in use or invalid details' }),
  })

  render(
    <MemoryRouter>
      <RegistrationPage />
    </MemoryRouter>
  )

  fillRegistrationForm({
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'wrongpassword',
  })

  fireEvent.click(screen.getByRole('button', { name: /register/i }))

  await waitFor(() =>
    expect(screen.getByText(/registration failed. please check your inputs/i)).toBeInTheDocument()
  )
})
