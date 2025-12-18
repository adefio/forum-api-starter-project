const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt', // Mewajibkan login (JWT)
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadHandler,
    // Tidak ada options auth, karena GET thread bersifat publik
  },
];

module.exports = routes;