import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, test, expect } from 'vitest'
import RegistrationPage from './RegistrationPage'
import axiosInstance from '@api/axiosInstance'

// Mock axiosInstance
vi.mock('@api/axiosInstance')

beforeEach(() => {
  vi.resetAllMocks()
})

const fillRegistrationForm = ({ username, email, password }) => {
  fireEvent.change(screen.getByLabelText(/pen name/i), {
    target: { value: username },
  })
  fireEvent.change(screen.getByLabelText(/ravenmail/i), {
    target: { value: email },
  })
  fireEvent.change(screen.getByLabelText(/secret rune/i), {
    target: { value: password },
  })
}

test('registers successfully with correct details', async () => {
  axiosInstance.post.mockResolvedValueOnce({
    data: { id: 'some-user-id', message: 'Registration successful' }
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

  fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }))

  await waitFor(() =>
    expect(screen.getByText(/your legend begins/i)).toBeInTheDocument()
  )
})

test('shows error with invalid details', async () => {
  axiosInstance.post.mockResolvedValueOnce({
    data: { error_code: 'INVALID_DETAILS' }
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

  fireEvent.click(screen.getByRole('button', { name: /scribe me in/i }))

  await waitFor(() =>
    expect(screen.getByText(/the scroll was not sealed. check your runes/i)).toBeInTheDocument()
  )
})
