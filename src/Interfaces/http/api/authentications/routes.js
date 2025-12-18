const routes = (handler) => ([
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
  },
  {
    method: 'GET',
    path: '/authentications',
    handler: () => ({
      status: 'success',
      message: 'Authentication service is ready',
    }),
  },
]);

module.exports = routes;