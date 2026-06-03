export const RequestMethods = {
    POST: 'post',
    GET: 'get',
    PUT: 'put',
    DELETE: 'delete',
} as const

export type RequestMethod = typeof RequestMethods[keyof typeof RequestMethods]