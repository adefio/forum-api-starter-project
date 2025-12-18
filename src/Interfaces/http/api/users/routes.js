const routes = (handler) => ([
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/users',
    handler: () => ({
      status: 'success',
      message: 'User service is ready',
    }),
  },
]);

module.exports = routes;