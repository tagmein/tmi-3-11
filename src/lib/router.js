function loadRoutes([routesString]) {
 const routes = routesString.trim()
  .split('\n')
  .map(x => x.trim())
 const result = {}
 for (const route of routes) {
  result[route] = require(`./routes/${route}.js`)
 }
 return result
}

const routes = loadRoutes`
 data
 default
 session
`

const routeMap = {
 'GET /data': routes.data.read,
 'POST /data': routes.data.write,
 'GET /session/list': routes.session.list,
 'POST /session/create': routes.session.create,
 'POST /session/end': routes.session.end
}

module.exports = async function ({
 modules,
 request,
 requestBody,
 requestParams,
 requestPath,
 response,
 rootPath,
}) {
 const handler = routeMap[`${request.method} ${requestPath}`] ?? routes.default
 const {
  statusCode = 200,
  contentType = 'text/plain; charset=utf-8',
  content = '',
  headers = [],
 } = await handler({
  modules,
  request,
  requestBody,
  requestParams,
  requestPath,
  rootPath,
 }) ?? {
   statusCode: 500,
   content: 'Server error',
  }
 response.statusCode = statusCode
 response.setHeader('Content-Type', contentType)
 for (const [k, v] of headers) {
  response.setHeader(k, v)
 }
 response.write(content)
 response.end()
}
