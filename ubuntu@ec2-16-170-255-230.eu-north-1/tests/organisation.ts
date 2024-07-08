// import request from 'supertest';
// import { app } from '../src/server'; // Assuming you export the app from src/server.ts
// import { connectionSource } from '../src/database/ormconfig';

// describe('Organisation API', () => {
//   let authToken: string;

//   beforeAll(async () => {
//     await connectionSource.initialize();

//     const registerRes = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'Jane',
//         lastName: 'Doe',
//         email: 'jane.doe@example.com',
//         password: 'password123',
//         phone: '1234567890',
//       });

//     authToken = registerRes.body.data.accessToken;
//   }, 10000); // Increase timeout to 10 seconds

//   afterAll(async () => {
//     await connectionSource.destroy();
//   });

//   it('should create a new organisation', async () => {
//     const res = await request(app)
//       .post('/api/organisations')
//       .set('Authorization', `Bearer ${authToken}`)
//       .send({
//         name: 'Jane\'s Organisation',
//         description: 'Organisation for Jane Doe',
//       });

//     expect(res.status).toBe(201);
//     expect(res.body.status).toBe('success');
//     expect(res.body.data.name).toBe('Jane\'s Organisation');
//   });

//   it('should retrieve all organisations of the logged-in user', async () => {
//     const res = await request(app)
//       .get('/api/organisations')
//       .set('Authorization', `Bearer ${authToken}`);

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe('success');
//     expect(res.body.data.organisations.length).toBeGreaterThan(0);
//   });

//   it('should retrieve a specific organisation by ID', async () => {
//     const orgsRes = await request(app)
//       .get('/api/organisations')
//       .set('Authorization', `Bearer ${authToken}`);

//     const orgId = orgsRes.body.data.organisations[0].orgId;

//     const res = await request(app)
//       .get(`/api/organisations/${orgId}`)
//       .set('Authorization', `Bearer ${authToken}`);

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe('success');
//     expect(res.body.data.orgId).toBe(orgId);
//   });
// });
