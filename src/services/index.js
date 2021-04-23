const baseURL =
  process.env.NODE_ENV === 'test' ? '' : process.env.REACT_APP_GITHUB_API_URL

export const getRepos = ({ q, rowsPerPage, currentPage }) =>
  fetch(
    `${baseURL}/search/repositories?q=${q}&page=${currentPage}&per_page=${rowsPerPage}`,
  )

export default {
  getRepos,
}
