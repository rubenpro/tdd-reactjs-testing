import React from 'react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { GithubSearchPage } from './githubSearchPage'
import {
  makeFakeResponse,
  makeFakeRepo,
  getRepositoryListByName,
  makeFakeError,
} from '../../__fixtures__/repos'
import { STATUS } from '../../consts'
import { handlerPaginated } from '../../__fixtures__/handlers'

const fakeResponse = makeFakeResponse({ totalCount: 1 })
const fakeRepo = makeFakeRepo()
fakeResponse.items = [fakeRepo]

const server = setupServer(
  rest.get('/search/repositories', (req, res, ctx) =>
    res(ctx.status(STATUS.OK), ctx.json(fakeResponse)),
  ),
)

beforeAll(() => server.listen())

beforeEach(() => render(<GithubSearchPage />))

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

const defaultSearchResultsMessage = /please provide a search option and click in the search button/i
const getSearchButton = () => screen.getByRole('button', { name: /search/i })
const clickSearchButton = () => fireEvent.click(getSearchButton())

describe('when the GithubSeachPage is mounted', () => {
  test('must display a title', () => {
    expect(
      screen.getByRole('heading', { name: /github search page/i }),
    ).toBeInTheDocument()
  })

  test('must be an input to filter with label "filter by"', () => {
    expect(screen.getByLabelText(/filter by/i)).toBeInTheDocument()
  })

  test('must be a Search button', () => {
    expect(getSearchButton()).toBeInTheDocument()
  })

  test('must be an initial state message "Please provide a search option and click in the search button"', () => {
    expect(screen.getByText(defaultSearchResultsMessage)).toBeInTheDocument()
  })
})

describe('when the user does a search', () => {
  test('the search button should be disabled until the search is done', async () => {
    expect(getSearchButton()).not.toBeDisabled()

    fireEvent.change(
      screen.getByLabelText(/filter by/i, { target: { value: 'test' } }),
    )

    expect(getSearchButton()).not.toBeDisabled()

    clickSearchButton()

    expect(getSearchButton()).toBeDisabled()

    await waitFor(() => expect(getSearchButton()).not.toBeDisabled())
  })

  test('the data should be displayed as a sticky table', async () => {
    clickSearchButton()

    await waitFor(() =>
      expect(
        screen.queryByText(defaultSearchResultsMessage),
      ).not.toBeInTheDocument(),
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  test('the table headers must contain: Repository, stars, forks, open issues and updated at', async () => {
    clickSearchButton()

    // find methods return promises
    const table = await screen.findByRole('table')

    const tableHeaders = within(table).getAllByRole('columnheader')

    expect(tableHeaders).toHaveLength(5)

    const [repository, stars, forks, openIssues, updatedAt] = tableHeaders

    expect(repository).toHaveTextContent(/repository/i)
    expect(stars).toHaveTextContent(/stars/i)
    expect(forks).toHaveTextContent(/forks/i)
    expect(openIssues).toHaveTextContent(/open issues/i)
    expect(updatedAt).toHaveTextContent(/updated at/i)
  })

  test(`each table result must contain: owner avatar image, name, stars, forks, open issues, updated at &
    should have a link that opens in a new tab`, async () => {
    clickSearchButton()

    const table = await screen.findByRole('table')

    const withinTable = within(table)

    const tableCells = withinTable.getAllByRole('cell')

    const [repository, stars, forks, openIssues, updatedAt] = tableCells

    const avatarImg = within(repository).getByRole('img', {
      name: fakeRepo.name,
    })

    expect(avatarImg).toBeInTheDocument()

    expect(tableCells).toHaveLength(5)

    expect(repository).toHaveTextContent(fakeRepo.name)
    expect(stars).toHaveTextContent(fakeRepo.stargazers_count)
    expect(forks).toHaveTextContent(fakeRepo.forks_count)
    expect(openIssues).toHaveTextContent(fakeRepo.open_issues_count)
    expect(updatedAt).toHaveTextContent(fakeRepo.updated_at)

    expect(
      within(repository).getByText(fakeRepo.name).closest('a'),
    ).toHaveAttribute('href', fakeRepo.html_url)

    expect(
      within(repository).getByText(fakeRepo.name).closest('a'),
    ).toHaveAttribute('target', '_blank')

    expect(avatarImg).toHaveAttribute('src', fakeRepo.owner.avatar_url)
  })

  test('must display the total results number of the search and the current number of results', async () => {
    clickSearchButton()

    await screen.findByRole('table')

    expect(screen.getByText(/1-1 of 1/i)).toBeInTheDocument()
  })

  test('the results size per page select options must be: 30, 50, 100 with 30 as default option', async () => {
    clickSearchButton()

    await screen.findByRole('table')

    const rowsPerPageText = screen.getByLabelText(/rows per page/i)

    expect(rowsPerPageText).toBeInTheDocument()

    fireEvent.mouseDown(rowsPerPageText)

    const listbox = screen.getByRole('listbox', { name: /rows per page/i })

    const options = within(listbox).getAllByRole('option')

    const [option30, option50, option100] = options

    expect(option30).toHaveTextContent(/30/)
    expect(option50).toHaveTextContent(/50/)
    expect(option100).toHaveTextContent(/100/)
  })

  test('must exists the previous page button and the next page button', async () => {
    clickSearchButton()

    await screen.findByRole('table')

    const previousPageButton = screen.getByRole('button', {
      name: /previous page/i,
    })

    const nextPageButton = screen.getByRole('button', { name: /next page/i })

    expect(previousPageButton).toBeInTheDocument()

    expect(previousPageButton).toBeDisabled()

    expect(nextPageButton).toBeInTheDocument()
  })
})

describe('when the user does a search with no results', () => {
  // test.todo('must show an empty state message')
  test('must show an empty state message "Your search has no results', async () => {
    // we should see what returns the real api with an unexisting query for no results
    // in the Github API, it returns a 200 with empty value
    server.use(
      rest.get('/search/repositories', (req, res, ctx) =>
        res(ctx.status(STATUS.OK), ctx.json(makeFakeResponse({}))),
      ),
    )

    clickSearchButton()

    await waitFor(() =>
      expect(
        screen.getByText(/your search has no results/i),
      ).toBeInTheDocument(),
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('when the user types on the "filter by" filter and does a search', () => {
  test('must display the related repositories', async () => {
    const REPO_NAME = 'laravel'
    const expectedRepo = getRepositoryListByName({ name: REPO_NAME })[0]

    server.use(
      rest.get('/search/repositories', (req, res, ctx) =>
        res(
          ctx.status(STATUS.OK),
          ctx.json({
            ...makeFakeResponse(),
            items: getRepositoryListByName({
              name: req.url.searchParams.get('q'),
            }),
          }),
        ),
      ),
    )

    fireEvent.change(screen.getByLabelText(/filter by/i), {
      target: { value: REPO_NAME },
    })

    clickSearchButton()

    const table = await screen.findByRole('table')

    expect(table).toBeInTheDocument()

    const withinTable = within(table)

    const tableCells = withinTable.getAllByRole('cell')

    const [repository] = tableCells

    expect(repository).toHaveTextContent(expectedRepo.name)
  })
})

describe('when the user does a search and select 50 rows per page', () => {
  test('must fetch a new search and display 50 row results on the table', async () => {
    server.use(rest.get('/search/repositories', handlerPaginated))

    clickSearchButton()

    // expect(await screen.findByRole('table')).toBeInTheDocument()
    // expect(await screen.findAllByRole('row')).toHaveLength(31) // 30 + header
    const table = await screen.findByRole('table')
    const tableBody = within(table).getAllByRole('rowgroup')[1]
    expect(await within(tableBody).findAllByRole('row')).toHaveLength(30)

    fireEvent.mouseDown(screen.getByLabelText(/rows per page/i))
    fireEvent.click(screen.getByRole('option', { name: '50' }))

    await waitFor(
      () =>
        expect(
          screen.getByRole('button', { name: /search/i }),
        ).not.toBeDisabled(),
      { timeout: 3000 },
    )
    expect(within(tableBody).getAllByRole('row')).toHaveLength(50)
  }, 6000) // timeout
})

describe('when the user does a search and then on next page button and then on the previous page button', () => {
  test('must display the previous repositories page', async () => {
    server.use(rest.get('/search/repositories', handlerPaginated))

    clickSearchButton()

    expect(await screen.findByRole('table')).toBeInTheDocument()

    expect(screen.getByRole('cell', { name: /repo-1-0/ })).toBeInTheDocument()

    const nextPageButton = screen.getByRole('button', { name: /next page/i })
    const searchButton = screen.getByRole('button', { name: /search/i })

    expect(nextPageButton).not.toBeDisabled()

    fireEvent.click(nextPageButton)

    expect(searchButton).toBeDisabled()

    await waitFor(() => expect(searchButton).not.toBeDisabled(), {
      timeout: 3000,
    })

    expect(screen.getByRole('cell', { name: /repo-2-0/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /previous page/i }))

    await waitFor(() => expect(searchButton).not.toBeDisabled(), {
      timeout: 3000,
    })

    expect(screen.getByRole('cell', { name: /repo-1-0/ })).toBeInTheDocument()
  }, 30000)
})

describe('when the user does a search and clicks on next page button and selects 50 rows per page', () => {
  test('must display the results of the first page', async () => {
    server.use(rest.get('/search/repositories', handlerPaginated))

    clickSearchButton()

    expect(await screen.findByRole('table')).toBeInTheDocument()

    expect(screen.getByRole('cell', { name: /repo-1-0/ })).toBeInTheDocument()

    const nextPageButton = screen.getByRole('button', { name: /next page/i })
    const searchButton = screen.getByRole('button', { name: /search/i })

    expect(nextPageButton).not.toBeDisabled()

    fireEvent.click(nextPageButton)

    expect(searchButton).toBeDisabled()

    await waitFor(() => expect(searchButton).not.toBeDisabled(), {
      timeout: 3000,
    })

    expect(screen.getByRole('cell', { name: /repo-2-0/ })).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByLabelText(/rows per page/i))
    fireEvent.click(screen.getByRole('option', { name: '50' }))

    await waitFor(
      () =>
        expect(
          screen.getByRole('button', { name: /search/i }),
        ).not.toBeDisabled(),
      { timeout: 3000 },
    )

    expect(screen.getByRole('cell', { name: /repo-1-0/ })).toBeInTheDocument()
  }, 30000)
})

describe('when the user does a search and clicks on next page button and clicks on search again', () => {
  test('must display the results of the first page', async () => {
    server.use(rest.get('/search/repositories', handlerPaginated))

    clickSearchButton()

    expect(await screen.findByRole('table')).toBeInTheDocument()

    expect(screen.getByRole('cell', { name: /repo-1-0/ })).toBeInTheDocument()

    const nextPageButton = screen.getByRole('button', { name: /next page/i })
    const searchButton = screen.getByRole('button', { name: /search/i })

    expect(nextPageButton).not.toBeDisabled()

    fireEvent.click(nextPageButton)

    expect(searchButton).toBeDisabled()

    await waitFor(() => expect(searchButton).not.toBeDisabled(), {
      timeout: 3000,
    })

    expect(screen.getByRole('cell', { name: /repo-2-0/ })).toBeInTheDocument()

    clickSearchButton()

    await waitFor(() => expect(searchButton).not.toBeDisabled(), {
      timeout: 3000,
    })

    expect(screen.getByRole('cell', { name: /repo-1-0/ })).toBeInTheDocument()
  }, 30000)
})

describe('when there is an Unprocessable Entity from the backend', () => {
  test('must display an alert with the error message from the service', async () => {
    expect(screen.queryByText(/unprocessable entity/i)).not.toBeInTheDocument()

    server.use(
      rest.get('/search/repositories', (req, res, ctx) =>
        res(
          ctx.status(STATUS.UNPROCESSABLE_ENTITY),
          ctx.json(makeFakeError({ message: 'Unprocessable Entity' })),
        ),
      ),
    )

    clickSearchButton()

    expect(await screen.findByText(/unprocessable entity/i)).toBeVisible()
  })
})

describe('when there is an Unexpected Error from the backend', () => {
  test('must display an alert with the error message from the service', async () => {
    expect(screen.queryByText(/unexpected error/i)).not.toBeInTheDocument()

    server.use(
      rest.get('/search/repositories', (req, res, ctx) =>
        res(
          ctx.status(STATUS.UNEXPECTED_ERROR),
          ctx.json(makeFakeError({ message: 'Unexpected error' })),
        ),
      ),
    )

    clickSearchButton()

    expect(await screen.findByText(/unexpected error/i)).toBeVisible()
  })
})
