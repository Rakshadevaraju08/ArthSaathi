// src/modules/profile/profile.service.js
// Business logic for occupation-based profile creation

const prisma = require("../../config/db");

// ─────────────────────────────────────────
// SHARED — Update base User fields
// ─────────────────────────────────────────

const updateUserBaseProfile = async (
  userId,
  { occupation, monthlyIncome, monthlyExpenses, loanHistory, repaymentHabit }
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      occupation,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      monthlyExpenses: monthlyExpenses
        ? parseFloat(monthlyExpenses)
        : undefined,
      loanHistory: loanHistory || [],
      repaymentHabit: repaymentHabit || "no_loans_yet",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      occupation: true,
      monthlyIncome: true,
      monthlyExpenses: true,
      repaymentHabit: true,
    },
  });
};

// ─────────────────────────────────────────
// FARMER PROFILE
// ─────────────────────────────────────────

const createFarmerProfile = async (userId, body) => {
  const {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
    crops,
    inputCost,
    landArea,
    irrigationType,
    rtcVerified,
    rtcRecordId,
  } = body;

  // Check for existing profile
  const existing = await prisma.farmerProfile.findUnique({
    where: { userId },
  });
  if (existing) {
    const err = new Error("Farmer profile already exists for this user.");
    err.statusCode = 409;
    throw err;
  }

  // Update base user
  const user = await updateUserBaseProfile(userId, {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
  });

  // Create farmer profile
  const profile = await prisma.farmerProfile.create({
    data: {
      userId,
      crops: crops || [],
      inputCost: inputCost ? parseFloat(inputCost) : null,
      landArea: landArea || null,
      irrigationType: irrigationType || null,
      rtcVerified: rtcVerified === true || rtcVerified === "true",
      rtcRecordId: rtcRecordId || null,
    },
  });

  return { user, profile };
};

// ─────────────────────────────────────────
// SHOP PROFILE
// ─────────────────────────────────────────

const createShopProfile = async (userId, body) => {
  const {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
    shopName,
    investmentAmount,
    supplierCredit,
    inventoryCycle,
    monthlyRevenue,
  } = body;

  const existing = await prisma.shopProfile.findUnique({ where: { userId } });
  if (existing) {
    const err = new Error("Shop profile already exists for this user.");
    err.statusCode = 409;
    throw err;
  }

  const user = await updateUserBaseProfile(userId, {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
  });

  const profile = await prisma.shopProfile.create({
    data: {
      userId,
      shopName: shopName || null,
      investmentAmount: investmentAmount ? parseFloat(investmentAmount) : null,
      supplierCredit: supplierCredit ? parseFloat(supplierCredit) : null,
      inventoryCycle: inventoryCycle ? parseInt(inventoryCycle) : null,
      monthlyRevenue: monthlyRevenue ? parseFloat(monthlyRevenue) : null,
    },
  });

  return { user, profile };
};

// ─────────────────────────────────────────
// TAILOR PROFILE
// ─────────────────────────────────────────

const createTailorProfile = async (userId, body) => {
  const {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
    machineryCount,
    weeklyStitchCapacity,
    advanceDeposits,
    workType,
  } = body;

  const existing = await prisma.tailorProfile.findUnique({
    where: { userId },
  });
  if (existing) {
    const err = new Error("Tailor profile already exists for this user.");
    err.statusCode = 409;
    throw err;
  }

  const user = await updateUserBaseProfile(userId, {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
  });

  const profile = await prisma.tailorProfile.create({
    data: {
      userId,
      machineryCount: machineryCount ? parseInt(machineryCount) : null,
      weeklyStitchCapacity: weeklyStitchCapacity
        ? parseInt(weeklyStitchCapacity)
        : null,
      advanceDeposits: advanceDeposits ? parseFloat(advanceDeposits) : null,
      workType: workType || null,
    },
  });

  return { user, profile };
};

// ─────────────────────────────────────────
// GENERIC PROFILE (Daily Wage Worker)
// ─────────────────────────────────────────

const createGenericProfile = async (userId, body) => {
  const {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
    employmentStability,
    workingDaysPerMonth,
    paymentChannel,
    employer,
    workType,
  } = body;

  const existing = await prisma.genericProfile.findUnique({
    where: { userId },
  });
  if (existing) {
    const err = new Error("Generic profile already exists for this user.");
    err.statusCode = 409;
    throw err;
  }

  const user = await updateUserBaseProfile(userId, {
    occupation,
    monthlyIncome,
    monthlyExpenses,
    loanHistory,
    repaymentHabit,
  });

  const profile = await prisma.genericProfile.create({
    data: {
      userId,
      employmentStability: employmentStability || null,
      workingDaysPerMonth: workingDaysPerMonth
        ? parseInt(workingDaysPerMonth)
        : null,
      paymentChannel: paymentChannel || null,
      employer: employer || null,
      workType: workType || null,
    },
  });

  return { user, profile };
};

// ─────────────────────────────────────────
// GET PROFILE BY USER ID
// ─────────────────────────────────────────

const getProfileByUserId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      language: true,
      occupation: true,
      monthlyIncome: true,
      monthlyExpenses: true,
      loanHistory: true,
      repaymentHabit: true,
      village: true,
      district: true,
      farmerProfile: true,
      shopProfile: true,
      tailorProfile: true,
      genericProfile: true,
    },
  });

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  return user;
};

module.exports = {
  createFarmerProfile,
  createShopProfile,
  createTailorProfile,
  createGenericProfile,
  getProfileByUserId,
};