import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  Snackbar,
  TablePagination,
  TextField,
  Typography,
} from '@material-ui/core'

import { Content } from '../content'
import { getRepos } from '../../services'
import { GithubTable } from '../github-table'

const DEFAULT_ROWS_PER_PAGE = 30
const DEFAULT_CURRENT_PAGE = 0
const DEFAULT_TOTAL_COUNT = 0

export const GithubSearchPage = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [repositoryList, setRepositoryList] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE)
  const [totalCount, setTotalCount] = useState(DEFAULT_TOTAL_COUNT)
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const didMount = useRef(false)
  const searchByInput = useRef(null)

  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true)
      // await Promise.resolve()
      const response = await getRepos({
        q: searchByInput.current.value,
        rowsPerPage,
        currentPage,
      })

      if (!response.ok) {
        throw response
      }

      const data = await response.json()
      setRepositoryList(data.items)
      setTotalCount(data.total_count)
      setHasSearched(true)
    } catch (error) {
      const data = await error.json()
      setIsSnackbarOpen(true)
      setErrorMessage(data.message)
    } finally {
      setIsSearching(false)
    }
  }, [rowsPerPage, currentPage])

  const handleChangeRowsPerPage = ({ target: { value } }) => {
    setCurrentPage(DEFAULT_CURRENT_PAGE)
    setRowsPerPage(value)
  }

  const handleChangePage = (event, newPage) => setCurrentPage(newPage)

  const handleClickSearch = () => {
    if (currentPage === DEFAULT_CURRENT_PAGE) {
      handleSearch()
      return
    }

    setCurrentPage(DEFAULT_CURRENT_PAGE)
  }

  useEffect(() => {
    // to prevent search execution on the first time
    if (!didMount.current) {
      didMount.current = true
      return
    }
    handleSearch()
  }, [handleSearch, rowsPerPage])

  return (
    <Container>
      <Box my={4}>
        <Typography component="h1" variant="h3">
          Github search page
        </Typography>
      </Box>
      {/* <p>Please provide a search option and click in the search button</p> */}
      <Grid container spacing={2} justify="space-between">
        <Grid item md={6} xs={12}>
          <TextField
            inputRef={searchByInput}
            fullWidth
            label="Filter by"
            id="filterBy"
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <Button
            fullWidth
            color="primary"
            variant="contained"
            disabled={isSearching}
            onClick={handleClickSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>
      <Box my={4}>
        <Content hasSearched={hasSearched} repositoryList={repositoryList}>
          <>
            <GithubTable repositoryList={repositoryList} />
            <TablePagination
              rowsPerPageOptions={[30, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={currentPage}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </>
        </Content>
      </Box>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        message={errorMessage}
        /* action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
              UNDO
            </Button>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        } */
      />
    </Container>
  )
}

export default GithubSearchPage
