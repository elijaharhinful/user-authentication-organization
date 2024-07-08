import request from 'supertest';
import { app } from '../src/server';
import { connectionSource } from '../src/database/ormconfig';
import { User } from '../src/entities/User';
import { Organisation } from '../src/entities/Organisation';
import jwt, { JwtPayload } from "jsonwebtoken";

describe('Unit Test', () => {
  beforeAll(async () => {
    await connectionSource.initialize();
  }, 10000); // Increase timeout to 10 seconds

  afterAll(async () => {
    await connectionSource.destroy();
  }, 10000);

  beforeEach(async () => {
    // Delete users first to respect foreign key constraints

    await connectionSource.getRepository(Organisation).delete({});
    await connectionSource.getRepository(User).delete({});
  });

  // Unit Tests
  // Token generation unit test
  it('should generate token that contains correct user details and expires in 1hr', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Token',
        lastName: 'Tester',
        email: 'token.tester@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');

    const token = res.body.data.accessToken;
    const secret = process.env.JWT_SECRET || "my_jwt_secret";
    const decodedToken = jwt.verify(token, secret) as JwtPayload;

    expect(decodedToken).toHaveProperty('userId');
    expect(decodedToken).toHaveProperty('email');
    expect(decodedToken.email).toBe('token.tester@example.com');

    const expiryTime = decodedToken.exp! - decodedToken.iat!;
    expect(expiryTime).toBe(3600); // 1 hour in seconds
  });

  // Organisation unit test
  it('should ensure users cannot see data from organisations they do not have access to', async () => {
    // Register first user and create an organisation
    const res1 = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res1.status).toBe(201);
    expect(res1.body.status).toBe('success');

    const orgRes1 = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${res1.body.data.accessToken}`)
      .send({
        name: 'Alice Organisation',
        description: 'Organisation created by Alice',
      });

    expect(orgRes1.status).toBe(201);
    const aliceOrgId = orgRes1.body.data.orgId;

    // Register second user
    const res2 = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob.jones@example.com',
        password: 'password123',
        phone: '0987654321',
      });

    expect(res2.status).toBe(201);
    expect(res2.body.status).toBe('success');

    // Attempt to access Alice's organisation with Bob's credentials
    const orgRes2 = await request(app)
      .get(`/api/organisations/${aliceOrgId}`)
      .set('Authorization', `Bearer ${res2.body.data.accessToken}`);

    expect(orgRes2.status).toBe(403);
    expect(orgRes2.body.status).toBe('error');
    expect(orgRes2.body.message).toBe('You do not have access to this organisation');
  });
});

describe('End-to-End Test', () => {
  beforeAll(async () => {
    await connectionSource.initialize();
  }, 10000); // Increase timeout to 10 seconds

  afterAll(async () => {
    await connectionSource.destroy();
  }, 10000);

  beforeEach(async () => {
    // Delete users first to respect foreign key constraints

    await connectionSource.getRepository(Organisation).delete({});
    await connectionSource.getRepository(User).delete({});
  });

  // End-to-End Tests

  // Successful user registration with default organisation
  it('should register user successfully with default organisation', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      })

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.firstName).toBe('John');
    expect(res.body.data.user.lastName).toBe('Doe');
    expect(res.body.data.user.email).toBe('john.doe@example.com')

    // Retrieve the organisation from the database
    const organisationRepository = connectionSource.getRepository(Organisation);
    const userOrganisations = await organisationRepository
      .createQueryBuilder('organisation')
      .leftJoin('organisation.users', 'user')
      .where('user.email = :email', { email: 'john.doe@example.com' })
      .getOne();

    expect(userOrganisations).not.toBeNull();
    expect(userOrganisations!.name).toBe("John's Organisation");
  });

  // User login with valid and invalid credentials
  it('should log the user in successfully with valid credentials and fail otherwise', async () => {
    //first register a user
    await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    // Test successful login
    const successLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'password123',
      });

    expect(successLoginRes.status).toBe(200);
    expect(successLoginRes.body.status).toBe('success');
    expect(successLoginRes.body.data).toHaveProperty('user');
    expect(successLoginRes.body.data).toHaveProperty('accessToken');
    expect(successLoginRes.body.data.user.email).toBe('jane.doe@example.com');
    expect(successLoginRes.body.data.user.firstName).toBe('Jane');
    expect(successLoginRes.body.data.user.lastName).toBe('Doe');

    // Test failed login
    const failedLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

    expect(failedLoginRes.status).toBe(401);
    expect(failedLoginRes.body.status).toBe('Bad request');
    expect(failedLoginRes.body).toHaveProperty('message');
    expect(failedLoginRes.body.message).toContain('Authentication failed');
  });

  // User login with invalid credentials
  // it('should fail to log in with invalid credentials', async () => {
  //   const loginRes = await request(app)
  //     .post('/auth/login')
  //     .send({
  //       email: 'nonexistent@example.com',
  //       password: 'wrongpassword',
  //     });

  //   expect(loginRes.status).toBe(401);
  //   expect(loginRes.body.status).toBe('Bad request');
  //   expect(loginRes.body).toHaveProperty('message');
  //   expect(loginRes.body.message).toContain('Authentication failed');
  // });

  // User registration with missing required fields
  describe('Registration with missing fields', () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'password'] as const;
    type RequiredField = typeof requiredFields[number];

    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '1234567890'
    };

    requiredFields.forEach((field) => {
      it(`should fail if ${field} is missing`, async () => {
        const testData = { ...validData };
        delete testData[field];

        const res = await request(app)
          .post('/auth/register')
          .send(testData);

        expect(res.status).toBe(422);
        expect(res.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: field,
              message: expect.stringContaining('required')
            })
          ])
        );
      });
    });
  });

  // User registration with first name missing
  it('should fail with status 422 if firstName is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual({
      field: 'firstName',
      message: 'First name is required'
    });
  });

  // User registration with last name missing
  it('should fail with status 422 if lastName is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual({
      field: 'lastName',
      message: 'Last name is required'
    });
  });

  // User registration with email missing
  it('should fail with status 422 if email is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).toBe(422);
    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({
      field: 'email',
      message: expect.stringContaining('Email is required')
    }));
  });

  // User registration with password missing
  it('should fail with status 422 if password is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual({
      field: 'password',
      message: 'Password is required'
    });
  });

  // Duplicate email registration
  it('should fail if there is duplicate email or userID', async () => {
    // Register user first
    await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jay',
        lastName: 'Ken',
        email: 'jay.ken@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    // second signup attempt
    const RegRes = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Fii',
        lastName: 'Nilso',
        email: 'jay.ken@example.com',
        password: 'password567',
        phone: '1234523890',
      });
    expect(RegRes.status).toBe(422);
    expect(RegRes.body).toHaveProperty('errors');
    expect(RegRes.body.errors).toContainEqual({
      field: 'email',
      message: 'Email already exists'
    });
  });
});

