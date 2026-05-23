const aiService = require('./ai.service');
const ApiResponse = require('../../utils/apiResponse');

class AiController {
  async analyzeInput(req, res, next) {
    try {
      const { contextType, payload } = req.body;
      const analysis = await aiService.processContext(contextType, payload);
      return ApiResponse.success(res, 'AI Processing execution successful', analysis, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AiController();