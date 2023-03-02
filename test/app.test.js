const app = require('../src/index');
const { OK } = require('http-status');
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('chai').assert;
const expect = chai.expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const Task = require('../src/models/Task');
const { v4: uuidv4 } = require('uuid');
const User = require('../src/models/User');
const { createTask } = require('../src/controllers/base.controller');
const {
  createUser,
  authorizedManager,
  authorizedTechnician,
  login,
} = require('../src/controllers/auth.controller');
const bcrypt = require('bcrypt');
chai.use(chaiHttp);
const TECHNICIAN = 'Technician';
const MANAGER = 'Manager';

//#region /*** BASE CONTROLLER ***/

/*
 * Test the / route
 */
describe('/', () => {
  it('Test/', (done) => {
    chai
      .request(app)
      .get('/')
      .end((err, res) => {
        assert.equal(res.status, 200);
        done();
      });
  });
});

/*
 * Test the /task GET route
 */
describe('/task', () => {
  it('/task returns an empty Unauthorized', (done) => {
    chai
      .request(app)
      .get('/tasks')
      // .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        assert.equal(res.status, 401);
        done();
      });
  });

  it('/task returns an array with 1 element', (done) => {
    chai
      .request(app)
      .get('/tasks')
      .end((err, res) => {
        assert.equal(res.status, 401);
        done();
      });
  });
});

/*
 * Test the /task/create  route
 */
describe('/task/create', () => {
  let token;
  before(() => {
    // generate a token for testing
    token = jwt.sign({ id: 'user-123' }, process.env.JWT_SECRET);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new task and return it in the response', async () => {
    // Set up the test data
    const fakeUserId = 'fake_user_id';
    const fakeToken = 'fake_token';
    const fakeTask = {
      id: 'fake_task_id',
      summary: 'Test task',
      userId: fakeUserId,
    };
    const req = {
      headers: {
        authorization: `Bearer ${fakeToken}`,
      },
      body: {
        summary: fakeTask.summary,
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const parseJwtStub = sinon.stub().returns({ id: fakeUserId });

    // Call the function being tested
    await createTask(parseJwtStub)(req, res);
    // Check the results
    expect(parseJwtStub.calledOnceWithExactly(fakeToken)).to.be.true;
    expect(res.status.calledOnceWithExactly(200)).to.be.true;
  });
});

//#endregion

//#region /*** AUTH CONTROLLER ***/

/*
 * Test the /user/create POST route
 */
describe('/user/create', () => {
  it('should create a new user', async () => {
    // Mock the request and response objects
    const req = {
      body: {
        firstName: 'Mauro',
        lastName: 'Alberto',
        email: 'mauro@example.com',
        password: 'password123',
        role: 'Technician',
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    // Call the createUser function with the mock request and response objects
    await createUser(req, res);

    // Assert that the response was sent with the correct data
    expect(res.status.calledWith(OK)).to.be.true;
    expect(res.json.calledWith({ newUser: sinon.match.object })).to.be.true;
  });
});

/*
 * Test the authorizedTechnician middleware
 */

describe('authorizedTechnician', () => {
  it('should call next if the user is an authorized technician', () => {
    const token = 'fake_token';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: sinon.spy(), json: sinon.spy() };
    const next = sinon.spy();
    const parseJwtStub = sinon.stub().returns({ role: TECHNICIAN });
    const middleware = authorizedTechnician(parseJwtStub);

    middleware(req, res, next);

    expect(parseJwtStub.calledOnceWithExactly(token)).to.be.true;
    expect(next.called).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.called).to.be.false;
  });

  it('should return unauthorized if the user is not an authorized technician', () => {
    const token = 'fake_token';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();
    const parseJwtStub = sinon.stub().returns({ role: MANAGER });
    const middleware = authorizedTechnician(parseJwtStub);

    middleware(req, res, next);

    expect(parseJwtStub.calledOnceWithExactly(token)).to.be.true;
    expect(next.called).to.be.false;
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Unauthorized to access this page.' }),
    ).to.be.true;
  });

  it('should return unauthorized if there is no token', () => {
    const req = { headers: {} };
    const res = { status: sinon.spy(() => res), json: sinon.spy() };
    const next = sinon.spy();
    const parseJwtStub = sinon.stub().returns({});
    const middleware = authorizedTechnician(parseJwtStub);

    middleware(req, res, next);

    expect(parseJwtStub.called).to.be.false;
    expect(next.called).to.be.false;
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Unauthorized to access this page.' }),
    ).to.be.true;
  });
});

/*
 * Test the authorizedManager middleware
 */

describe('authorizedManager', () => {
  it('should call next if the user is an authorized technician', () => {
    const token = 'fake_token';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: sinon.spy(), json: sinon.spy() };
    const next = sinon.spy();
    const parseJwtStub = sinon.stub().returns({ role: MANAGER });
    const middleware = authorizedManager(parseJwtStub);

    middleware(req, res, next);

    expect(parseJwtStub.calledOnceWithExactly(token)).to.be.true;
    expect(next.called).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.called).to.be.false;
  });

  it('should return unauthorized if the user is not an authorized manager', () => {
    const token = 'fake_token';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();
    const parseJwtStub = sinon.stub().returns({ role: TECHNICIAN });
    const middleware = authorizedManager(parseJwtStub);

    middleware(req, res, next);

    expect(parseJwtStub.calledOnceWithExactly(token)).to.be.true;
    expect(next.called).to.be.false;
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Unauthorized to access this page.' }),
    ).to.be.true;
  });

  it('should return unauthorized if there is no token', () => {
    const req = { headers: {} };
    const res = { status: sinon.spy(() => res), json: sinon.spy() };
    const next = sinon.spy();
    const parseJwtStub = sinon.stub().returns({});
    const middleware = authorizedManager(parseJwtStub);

    middleware(req, res, next);

    expect(parseJwtStub.called).to.be.false;
    expect(next.called).to.be.false;
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Unauthorized to access this page.' }),
    ).to.be.true;
  });
});

/*
 * Test the login endpoint
 */

describe('/login', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 if email or password is missing', async () => {
    const req = { body: {} };
    //It returns the res object itself, so we can chain
    //without it we couldn't access the status or json result
    const res = { status: sinon.spy(() => res), json: sinon.spy() };

    await login(req, res);

    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(
      res.json.calledOnceWith({
        message: 'Invalid request. Missing parameters email or password.',
      }),
    ).to.be.true;
  });

  it('should return 404 if user not found', async () => {
    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = { status: sinon.spy(() => res), json: sinon.spy() };
    //We simulate a findOne that returns null in order to simulate a user not found
    const findOneStub = sinon.stub(User, 'findOne').returns(null);

    await login(req, res);

    expect(findOneStub.calledOnceWith({ where: { email: req.body.email } })).to
      .be.true;
    expect(res.status.calledOnceWith(404)).to.be.true;
    expect(res.json.calledOnceWith({ message: 'User not found.' })).to.be.true;
  });

  it('should return 401 if incorrect password', async () => {
    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = { status: sinon.spy(() => res), json: sinon.spy() };

    const findOneStub = sinon.stub(User, 'findOne').returns({
      password: bcrypt.hashSync('correct_password', 10),
    });

    await login(req, res);

    expect(findOneStub.calledOnceWith({ where: { email: req.body.email } })).to
      .be.true;
    expect(bcrypt.compareSync(req.body.password, findOneStub().password)).to.be
      .false;
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(res.json.calledOnceWith({ message: 'Incorrect Password.' })).to.be
      .true;
  });

  it('should return 200 and token if login successful', async () => {
    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = { status: sinon.spy(() => res), json: sinon.spy() };
    const user = {
      email: 'test@example.com',
      fullName: 'Test User',
      id: 123,
      role: 'user',
      password: bcrypt.hashSync('password', 10),
    };

    const findOneStub = sinon.stub(User, 'findOne').returns(user);
    const compareSyncStub = sinon.stub(bcrypt, 'compareSync').returns(true);
    const signStub = sinon.stub(jwt, 'sign').returns('mocked_token');

    await login(req, res);

    expect(findOneStub.calledOnceWith({ where: { email: req.body.email } })).to
      .be.true;
    expect(compareSyncStub.calledOnceWith(req.body.password, user.password)).to
      .be.true;
    expect(
      signStub.calledOnceWith(
        {
          email: user.email,
          fullName: user.fullName,
          id: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
      ),
    ).to.be.true;
    expect(res.status.calledOnceWith(OK)).to.be.true;
  });
});

//#endregion
