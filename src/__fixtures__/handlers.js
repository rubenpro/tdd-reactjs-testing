import { STATUS } from '../consts'
import { getRepositoriesPerPage, makeFakeResponse } from './repos'

export const handlerPaginated = (req, res, ctx) =>
  res(
    ctx.status(STATUS.OK),
    ctx.json({
      ...makeFakeResponse({ totalCount: 1000 }),
      items: getRepositoriesPerPage({
        currentPage: Number(req.url.searchParams.get('page')),
        perPage: Number(req.url.searchParams.get('per_page')),
      }),
    }),
  )

export default {
  handlerPaginated,
}
