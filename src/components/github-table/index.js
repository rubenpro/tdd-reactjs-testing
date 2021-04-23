import React from 'react'
import PropTypes from 'prop-types'
import {
  Avatar,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const tableHeaderCells = [
  'Repository',
  'Stars',
  'Forks',
  'Open issues',
  'Updated at',
]

const useStyles = makeStyles({
  container: {
    maxHeight: 440,
  },
})

export const GithubTable = ({ repositoryList }) => {
  const classes = useStyles()
  return (
    <TableContainer className={classes.container}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {tableHeaderCells.map(name => (
              <TableCell key={name}>{name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {repositoryList.map(
            ({
              id,
              name,
              stargazers_count: stargazersCount,
              forks_count: forksCount,
              open_issues_count: openIssuesCount,
              updated_at: updatedAt,
              html_url: htmlURL,
              owner: { avatar_url: avatarURL },
            }) => (
              <TableRow key={id}>
                <TableCell>
                  <Avatar alt={name} src={avatarURL} />
                  <Link href={htmlURL} rel="noreferrer" target="_blank">
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{stargazersCount}</TableCell>
                <TableCell>{forksCount}</TableCell>
                <TableCell>{openIssuesCount}</TableCell>
                <TableCell>{updatedAt}</TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default {
  GithubTable,
}

GithubTable.propTypes = {
  repositoryList: PropTypes.arrayOf(PropTypes.object).isRequired,
}
