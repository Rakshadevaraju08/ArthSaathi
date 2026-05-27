// src/modules/users/users.service.js

const prisma = require('../../config/db');

/**
 * Update user profile fields
 */
const updateProfile = async (userId, body) => {
  const { name, language, village, district } = body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(language && { language }),
      ...(village !== undefined && { village }),
      ...(district !== undefined && { district }),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      language: true,
      village: true,
      district: true,
      occupation: true,
      monthlyIncome: true,
      monthlyExpenses: true,
    },
  });

  return updated;
};

module.exports = { updateProfile };