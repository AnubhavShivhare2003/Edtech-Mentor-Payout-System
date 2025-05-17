const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { expect } = require('chai');

describe('API Routes Tests', () => {
  let adminToken;
  let mentorToken;
  let userId;

  // Test user credentials
  const adminUser = {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  };

  const mentorUser = {
    name: 'Mentor User',
    email: 'mentor@test.com',
    password: 'mentor123',
    role: 'mentor',
    hourlyRate: 50
  };

  before(async () => {
    // Clear test database
    await mongoose.connection.dropDatabase();
  });

  describe('Auth Routes', () => {
    it('should register admin user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(adminUser);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      adminToken = res.body.token;
    });

    it('should register mentor user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(mentorUser);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      mentorToken = res.body.token;
      userId = res.body.user._id;
    });

    it('should login admin user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', adminUser.email);
    });
  });

  describe('User Routes', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${mentorToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', mentorUser.email);
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        hourlyRate: 60,
        taxInfo: {
          pan: 'ABCDE1234F',
          gst: '12ABCDE1234F1Z5'
        },
        bankDetails: {
          accountNumber: '1234567890',
          ifsc: 'ABCD0123456',
          bankName: 'Test Bank'
        }
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(updateData);
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal(updateData.name);
    });

    it('should get all users (admin only)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(2);
    });
  });

  describe('Session Routes', () => {
    let sessionId;

    it('should create a session', async () => {
      const sessionData = {
        sessionType: 'live',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        baseRate: 100,
        notes: 'Test session'
      };

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(sessionData);
      expect(res.status).to.equal(201);
      sessionId = res.body._id;
    });

    it('should get all sessions', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('Payout Routes', () => {
    it('should get payout history', async () => {
      const res = await request(app)
        .get('/api/payouts/history')
        .set('Authorization', `Bearer ${mentorToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should get pending payouts (admin only)', async () => {
      const res = await request(app)
        .get('/api/payouts/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('Chat Routes', () => {
    it('should send a message', async () => {
      const messageData = {
        to: userId,
        message: 'Test message'
      };

      const res = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(messageData);
      expect(res.status).to.equal(201);
    });

    it('should get conversation history', async () => {
      const res = await request(app)
        .get(`/api/chat/conversations?with=${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  after(async () => {
    // Cleanup
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
}); 