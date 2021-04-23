import repositories30Paginated from './repos-30-paginated.json'
import repositories50Paginated from './repos-50-paginated.json'

// if object is not provided, we pass an empty object
export const makeFakeResponse = ({ totalCount = 0 } = {}) => ({
  total_count: totalCount,
  items: [],
})

export const makeFakeError = ({ message = 'Validation Failed' } = {}) => ({
  message,
})

export const makeFakeRepo = ({ id = '10270250', name = 'react' } = {}) => ({
  id,
  name,
  owner: {
    avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
  },
  html_url: 'https://github.com/facebook/react',
  updated_at: '2021-04-19',
  stargazers_count: 167107,
  forks_count: 33599,
  open_issues_count: 707,
})

const repositoryData = ['go', 'freeCodeCamp', 'laravel', 'Python', 'Java']

const repositoryList = repositoryData.map(name =>
  makeFakeRepo({ id: name, name }),
)

export const getRepositoryListByName = ({ name }) =>
  repositoryList.filter(repository => repository.name === name)

export const getRepositoriesPerPage = ({ currentPage, perPage }) =>
  perPage === 30
    ? repositories30Paginated[currentPage]
    : repositories50Paginated[currentPage]

export default {
  makeFakeResponse,
  makeFakeRepo,
  getRepositoryListByName,
  getRepositoriesPerPage,
}
