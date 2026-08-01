const request = require('supertest');
const { nanoid } = require('nanoid');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ClientError = require('../../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../../Commons/exceptions/DomainErrorTranslator');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const MessagesTableTestHelper = require('../../../../tests/MessagesTableTestHelper');
const messages = require('../../../Interfaces/http/api/messages');

const ConversationRepository = require('../../../Domains/messages/ConversationRepository');
const ConversationRepositoryPostgres = require('../../repository/ConversationRepositoryPostgres');
const UserRepository = require('../../../Domains/users/UserRepository');
const GetConversationsUseCase = require('../../../Applications/use_case/GetConversationsUseCase');
const StartConversationUseCase = require('../../../Applications/use_case/StartConversationUseCase');
const GetMessagesUseCase = require('../../../Applications/use_case/GetMessagesUseCase');
const SendMessageUseCase = require('../../../Applications/use_case/SendMessageUseCase');
const MarkMessagesReadUseCase = require('../../../Applications/use_case/MarkMessagesReadUseCase');

container.register([
  {
    key: ConversationRepository.name,
    Class: ConversationRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
  {
    key: GetConversationsUseCase.name,
    Class: GetConversationsUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'conversationRepository', internal: ConversationRepository.name }],
    },
  },
  {
    key: StartConversationUseCase.name,
    Class: StartConversationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'conversationRepository', internal: ConversationRepository.name },
        { name: 'userRepository', internal: UserRepository.name },
      ],
    },
  },
  {
    key: GetMessagesUseCase.name,
    Class: GetMessagesUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'conversationRepository', internal: ConversationRepository.name }],
    },
  },
  {
    key: SendMessageUseCase.name,
    Class: SendMessageUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'conversationRepository', internal: ConversationRepository.name }],
    },
  },
  {
    key: MarkMessagesReadUseCase.name,
    Class: MarkMessagesReadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'conversationRepository', internal: ConversationRepository.name }],
    },
  },
]);

const createApp = async () => {
  const app = await createServer(container);

  app.use('/messages', messages(container));

  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }
    return res.status(500).json({ status: 'error', message: 'terjadi kegagalan pada server kami' });
  });

  return app;
};

const registerAndLogin = async (app, { username, password = 'secret', fullname }) => {
  await request(app)
    .post('/users')
    .send({ username, password, fullname });

  const response = await request(app)
    .post('/authentications')
    .send({ username, password });

  return response.body.data.accessToken;
};

const setupConversation = async (app, userA, userB) => {
  const tokenA = await registerAndLogin(app, userA);
  const tokenB = await registerAndLogin(app, userB);

  const startResponse = await request(app)
    .post('/messages')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ username: userB.username, content: 'halo dari A' });

  const { conversationId } = startResponse.body.data;

  return { tokenA, tokenB, conversationId };
};

describe('/messages endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await MessagesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when GET /messages', () => {
    it('should response 401 without access token', async () => {
      const app = await createApp();

      const response = await request(app).get('/messages');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Missing authentication');
    });

    it('should response 200 and list conversations with other user, last message and unread count', async () => {
      const app = await createApp();
      const { tokenA, tokenB, conversationId } = await setupConversation(
        app,
        { username: 'alice', fullname: 'Alice A' },
        { username: 'bob', fullname: 'Bob B' },
      );

      await request(app)
        .post(`/messages/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ content: 'balasan dari B' });

      const responseA = await request(app)
        .get('/messages')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(responseA.status).toBe(200);
      expect(responseA.body.status).toBe('success');
      expect(responseA.body.data.conversations).toHaveLength(1);
      expect(responseA.body.data.conversations[0].conversationId).toBe(conversationId);
      expect(responseA.body.data.conversations[0].user.username).toBe('bob');
      expect(responseA.body.data.conversations[0].user.fullname).toBe('Bob B');
      expect(responseA.body.data.conversations[0].lastMessage.content).toBe('balasan dari B');
      expect(responseA.body.data.conversations[0].lastMessage.senderId).toBeDefined();
      expect(responseA.body.data.conversations[0].unreadCount).toBe(1);

      const responseB = await request(app)
        .get('/messages')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(responseB.status).toBe(200);
      expect(responseB.body.data.conversations[0].user.username).toBe('alice');
      expect(responseB.body.data.conversations[0].lastMessage.content).toBe('balasan dari B');
      expect(responseB.body.data.conversations[0].unreadCount).toBe(1);
    });
  });

  describe('when POST /messages', () => {
    it('should response 201 and create conversation with first message', async () => {
      const app = await createApp();
      const tokenA = await registerAndLogin(
        app,
        { username: 'alice', fullname: 'Alice A' },
      );
      await registerAndLogin(
        app,
        { username: 'bob', fullname: 'Bob B' },
      );

      const response = await request(app)
        .post('/messages')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ username: 'bob', content: 'halo bob' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.conversationId).toBeDefined();
      expect(response.body.data.message.id).toContain('message-');
      expect(response.body.data.message.content).toBe('halo bob');
      expect(response.body.data.message.date).toBeDefined();
      expect(response.body.data.message.senderId).toBeDefined();
      expect(response.body.data.message.isRead).toBe(false);

      const messagesRows = await MessagesTableTestHelper.findMessagesByConversationId(
        response.body.data.conversationId,
      );
      expect(messagesRows).toHaveLength(1);
    });

    it('should response 201 and reuse existing conversation', async () => {
      const app = await createApp();
      const { tokenA, conversationId } = await setupConversation(
        app,
        { username: 'alice', fullname: 'Alice A' },
        { username: 'bob', fullname: 'Bob B' },
      );

      const response = await request(app)
        .post('/messages')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ username: 'bob', content: 'pesan kedua' });

      expect(response.status).toBe(201);
      expect(response.body.data.conversationId).toBe(conversationId);

      const messagesRows = await MessagesTableTestHelper.findMessagesByConversationId(conversationId);
      expect(messagesRows).toHaveLength(2);
    });

    it('should response 404 when target username not found', async () => {
      const app = await createApp();
      const tokenA = await registerAndLogin(
        app,
        { username: 'alice', fullname: 'Alice A' },
      );

      const response = await request(app)
        .post('/messages')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ username: 'ghost', content: 'halo' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('user tidak ditemukan');
    });
  });

  describe('when GET /messages/:conversationId', () => {
    it('should response 200 and list messages ordered by date ascending', async () => {
      const app = await createApp();
      const { tokenA, tokenB, conversationId } = await setupConversation(
        app,
        { username: 'alice', fullname: 'Alice A' },
        { username: 'bob', fullname: 'Bob B' },
      );

      await request(app)
        .post(`/messages/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ content: 'balasan dari B' });

      const response = await request(app)
        .get(`/messages/${conversationId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.messages).toHaveLength(2);
      expect(response.body.data.messages[0].content).toBe('halo dari A');
      expect(response.body.data.messages[1].content).toBe('balasan dari B');
      expect(response.body.data.messages[0].username).toBe('alice');
      expect(response.body.data.messages[1].username).toBe('bob');
      expect(response.body.data.messages.every((message) => message.id.startsWith('message-'))).toBe(true);
    });

    it('should response 404 when conversation not found', async () => {
      const app = await createApp();
      const tokenA = await registerAndLogin(
        app,
        { username: 'alice', fullname: 'Alice A' },
      );

      const response = await request(app)
        .get('/messages/conversation-not-exists')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('percakapan tidak ditemukan');
    });

    it('should response 403 when user is not a participant', async () => {
      const app = await createApp();
      const { conversationId } = await setupConversation(
        app,
        { username: 'alice', fullname: 'Alice A' },
        { username: 'bob', fullname: 'Bob B' },
      );
      const tokenCharlie = await registerAndLogin(
        app,
        { username: 'charlie', fullname: 'Charlie C' },
      );

      const response = await request(app)
        .get(`/messages/${conversationId}`)
        .set('Authorization', `Bearer ${tokenCharlie}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Anda tidak berhak mengakses percakapan ini');

      const sendResponse = await request(app)
        .post(`/messages/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokenCharlie}`)
        .send({ content: 'menyusup' });

      expect(sendResponse.status).toBe(403);
    });
  });

  describe('when POST /messages/:conversationId/messages', () => {
    it('should response 201 and add message to conversation', async () => {
      const app = await createApp();
      const { tokenB, conversationId } = await setupConversation(
        app,
        { username: 'alice', fullname: 'Alice A' },
        { username: 'bob', fullname: 'Bob B' },
      );

      const response = await request(app)
        .post(`/messages/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ content: 'balasan dari B' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message.id).toContain('message-');
      expect(response.body.data.message.content).toBe('balasan dari B');
      expect(response.body.data.message.senderId).toBeDefined();
      expect(response.body.data.message.isRead).toBe(false);
    });
  });

  describe('when PUT /messages/:conversationId/read', () => {
    it('should response 200 and mark messages read', async () => {
      const app = await createApp();
      const { tokenB, conversationId } = await setupConversation(
        app,
        { username: 'alice', fullname: 'Alice A' },
        { username: 'bob', fullname: 'Bob B' },
      );

      const beforeResponse = await request(app)
        .get('/messages')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(beforeResponse.body.data.conversations[0].unreadCount).toBe(1);

      const response = await request(app)
        .put(`/messages/${conversationId}/read`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const afterResponse = await request(app)
        .get('/messages')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(afterResponse.body.data.conversations[0].unreadCount).toBe(0);

      const messagesRows = await MessagesTableTestHelper.findMessagesByConversationId(conversationId);
      expect(messagesRows[0].is_read).toBe(true);
    });
  });
});
