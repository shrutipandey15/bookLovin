import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'
import RegistrationPage from './RegistrationPage'
import axiosInstance from '@/api/axiosInstance'

// Mock axiosInstance
vi.mock('../../api/axiosInstance')

beforeEach(() => {
  vi.resetAllMocks()
})

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

  fireEvent.click(screen.getByRole('button', { name: /register/i }))

  await waitFor(() =>
    expect(screen.getByText(/registration successful! welcome/i)).toBeInTheDocument()
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

  fireEvent.click(screen.getByRole('button', { name: /register/i }))

  await waitFor(() =>
    expect(screen.getByText(/registration failed. please check your inputs/i)).toBeInTheDocument()
  )
})
