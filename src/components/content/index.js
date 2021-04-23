import React from 'react'
import PropTypes from 'prop-types'

import { Box, Typography } from '@material-ui/core'

export const Content = ({ hasSearched, repositoryList, children }) => {
  const isLoading = hasSearched && repositoryList.length
  const message = hasSearched
    ? 'Your search has no results'
    : 'Please provide a search option and click in the search button'

  if (isLoading) {
    return children
  }
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={400}
    >
      <Typography>{message}</Typography>
    </Box>
  )
}

export default Content

Content.propTypes = {
  hasSearched: PropTypes.bool.isRequired,
  repositoryList: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.node.isRequired,
}
