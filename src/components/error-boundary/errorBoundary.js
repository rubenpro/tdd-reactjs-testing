import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Typography } from '@material-ui/core'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleClickReload = () => window.location.reload()

  render() {
    const { children } = this.props
    const { hasError } = this.state

    if (hasError) {
      return (
        <>
          <Typography variant="h4">Unexpected error</Typography>
          <Button
            type="button"
            onClick={this.handleClickReload}
            variant="contained"
            color="primary"
          >
            Reload
          </Button>
        </>
      )
    }

    return children
  }
}

export default ErrorBoundary

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}
