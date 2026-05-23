const jwt = require('jsonwebtoken');
const env = require('../../config/environment');

class AuthService {
  async authenticateUser(phoneNumber, mpin) {
    // Hackathon execution validation logic (accepts any valid 4-digit MPIN for mock testing)
    if (!mpin || mpin.length !== 4) {
      throw new Error('Invalid MPIN configuration profiles supplied.');
    }

    // Static Mock Payload mapping representing a typical rural system user profile
    const mockUser = {
      id: "us-7749-karnataka",
      phoneNumber: phoneNumber,
      name: "Basavaraja Gowda",
      preferredLang: "kn"
    };

    // Issue Stateless System Signature Token
    const token = jwt.sign(
      { id: mockUser.id, phoneNumber: mockUser.phoneNumber },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user: mockUser, token };
  }
}

module.exports = new AuthService();