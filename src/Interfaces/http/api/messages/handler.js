const GetConversationsUseCase = require('../../../../Applications/use_case/GetConversationsUseCase');
const StartConversationUseCase = require('../../../../Applications/use_case/StartConversationUseCase');
const GetMessagesUseCase = require('../../../../Applications/use_case/GetMessagesUseCase');
const SendMessageUseCase = require('../../../../Applications/use_case/SendMessageUseCase');
const MarkMessagesReadUseCase = require('../../../../Applications/use_case/MarkMessagesReadUseCase');

class MessagesHandler {
  constructor(container) {
    this._container = container;

    this.getConversationsHandler = this.getConversationsHandler.bind(this);
    this.postStartConversationHandler = this.postStartConversationHandler.bind(this);
    this.getMessagesHandler = this.getMessagesHandler.bind(this);
    this.postMessageHandler = this.postMessageHandler.bind(this);
    this.putMessagesReadHandler = this.putMessagesReadHandler.bind(this);
  }

  async getConversationsHandler(req, res, next) {
    try {
      const getConversationsUseCase = this._container.getInstance(GetConversationsUseCase.name);
      const conversations = await getConversationsUseCase.execute(req.auth.id);

      res.status(200).json({
        status: 'success',
        data: {
          conversations,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async postStartConversationHandler(req, res, next) {
    try {
      const startConversationUseCase = this._container.getInstance(StartConversationUseCase.name);
      const { conversationId, message } = await startConversationUseCase.execute(req.auth.id, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          conversationId,
          message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessagesHandler(req, res, next) {
    try {
      const getMessagesUseCase = this._container.getInstance(GetMessagesUseCase.name);
      const { conversationId } = req.params;

      const messages = await getMessagesUseCase.execute(req.auth.id, conversationId);

      res.status(200).json({
        status: 'success',
        data: {
          messages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async postMessageHandler(req, res, next) {
    try {
      const sendMessageUseCase = this._container.getInstance(SendMessageUseCase.name);
      const { conversationId } = req.params;

      const message = await sendMessageUseCase.execute(req.auth.id, conversationId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putMessagesReadHandler(req, res, next) {
    try {
      const markMessagesReadUseCase = this._container.getInstance(MarkMessagesReadUseCase.name);
      const { conversationId } = req.params;

      await markMessagesReadUseCase.execute(req.auth.id, conversationId);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MessagesHandler;
