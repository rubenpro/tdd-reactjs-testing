import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import { ErrorBoundary } from './errorBoundary'

jest.spyOn(console, 'error')

const ThrowError = () => {
  throw new Error('ups')
}

describe('when the component works with no errors', () => {
  test('must render the component content', () => {
    render(
      <ErrorBoundary>
        <h1>Test pass</h1>
      </ErrorBoundary>,
    )

    expect(screen.getByText(/test pass/i)).toBeInTheDocument()
  })
})

describe('when the component throws an error', () => {
  test('must render the message "Unexpected error" and a reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })
})

describe('when the user click on the reload button', () => {
  test('must reload the app', () => {
    // we can't assign values to location properties
    // so whe have to delete it manually to define it later
    delete window.location
    window.location = {
      reload: jest.fn(),
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByRole('button', { name: /reload/i }))

    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })
})
