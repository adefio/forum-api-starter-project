const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putLikeCommentHandler,
    options: { 
      auth: 'forumapi_jwt' 
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}/comments',
    handler: () => ({
      status: 'success',
      message: 'Comment service is ready',
    }),
  },
];

module.exports = routes;