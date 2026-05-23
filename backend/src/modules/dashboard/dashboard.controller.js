const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../utils/apiResponse');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      // Identity context supplied down-stream automatically by standard protect middleware
      const userId = req.user.id; 
      const summary = await dashboardService.getDashboardSummary(userId);
      return ApiResponse.success(res, 'Dashboard analytics extracted successfully', summary, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();