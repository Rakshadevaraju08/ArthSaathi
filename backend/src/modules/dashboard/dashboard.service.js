class DashboardService {
  async getDashboardSummary(userId) {
    // Custom tailored mock dataset answering explicit rural tracking parameters requested
    return {
      financialHealthScore: 78,
      currencySymbol: "₹",
      summaryMetrics: {
        totalSavings: 14500.00,
        monthlyIncome: 22000.00,
        monthlyExpenses: 8500.00,
        availableCropLoanLimit: 50000.00
      },
      recentActivity: [
        { id: "tx-01", type: "INCOME", amount: 12000, category: "KCC_Loan_Disbursal", label: "KCC Loan Deposit", date: "2026-05-20" },
        { id: "tx-02", type: "EXPENSE", amount: 3200, category: "Fertilizer_Purchase", label: "Mahadhan Urea Supplier", date: "2026-05-18" }
      ],
      insights: [
        { level: "info", text_kn: "ನಿಮ್ಮ ರಸಗೊಬ್ಬರ ವೆಚ್ಚ ಕಳೆದ ತಿಂಗಳಿಗಿಂತ 12% ಹೆಚ್ಚಾಗಿದೆ.", text: "Your fertilizer spending is 12% higher than last month." },
        { level: "warning", text_kn: "ಸಂದೇಹಾಸ್ಪದ ಸಾಲದ ಕೊಡುಗೆ ಲಿಂಕ್ ಪತ್ತೆಯಾಗಿದೆ. ಜಾಗರೂಕರಾಗಿರಿ.", text: "Suspicious loan link intercepted via SMS. Avoid sharing details." }
      ]
    };
  }
}

module.exports = new DashboardService();