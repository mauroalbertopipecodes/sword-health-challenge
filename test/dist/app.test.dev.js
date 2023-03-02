"use strict";

var app = require('../src/index');

var _require = require('http-status'),
    OK = _require.OK;

var chai = require('chai');

var chaiHttp = require('chai-http');

var assert = require('chai').assert;

var expect = chai.expect;

var sinon = require('sinon');

var jwt = require('jsonwebtoken');

var Task = require('../src/models/Task');

var _require2 = require('uuid'),
    uuidv4 = _require2.v4;

var User = require('../src/models/User');

var _require3 = require('../src/controllers/base.controller'),
    createTask = _require3.createTask;

var _require4 = require('../src/controllers/auth.controller'),
    createUser = _require4.createUser,
    authorizedManager = _require4.authorizedManager,
    authorizedTechnician = _require4.authorizedTechnician,
    login = _require4.login;

var bcrypt = require('bcrypt');

chai.use(chaiHttp);
var TECHNICIAN = 'Technician';
var MANAGER = 'Manager'; //#region /*** BASE CONTROLLER ***/

/*
 * Test the / route
 */

describe('/', function () {
  it('Test/', function (done) {
    chai.request(app).get('/').end(function (err, res) {
      assert.equal(res.status, 200);
      done();
    });
  });
});
/*
 * Test the /task GET route
 */

describe('/task', function () {
  it('/task returns an empty Unauthorized', function (done) {
    chai.request(app).get('/tasks') // .set('Authorization', `Bearer ${token}`)
    .end(function (err, res) {
      assert.equal(res.status, 401);
      done();
    });
  });
  it('/task returns an array with 1 element', function (done) {
    chai.request(app).get('/tasks').end(function (err, res) {
      assert.equal(res.status, 401);
      done();
    });
  });
});
/*
 * Test the /task/create  route
 */

describe('/task/create', function () {
  var token;
  before(function () {
    // generate a token for testing
    token = jwt.sign({
      id: 'user-123'
    }, process.env.JWT_SECRET);
  });
  afterEach(function () {
    sinon.restore();
  });
  it('should create a new task and return it in the response', function _callee() {
    var fakeUserId, fakeToken, fakeTask, req, res, parseJwtStub;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Set up the test data
            fakeUserId = 'fake_user_id';
            fakeToken = 'fake_token';
            fakeTask = {
              id: 'fake_task_id',
              summary: 'Test task',
              userId: fakeUserId
            };
            req = {
              headers: {
                authorization: "Bearer ".concat(fakeToken)
              },
              body: {
                summary: fakeTask.summary
              }
            };
            res = {
              status: sinon.stub().returnsThis(),
              json: sinon.spy()
            };
            parseJwtStub = sinon.stub().returns({
              id: fakeUserId
            }); // Call the function being tested

            _context.next = 8;
            return regeneratorRuntime.awrap(createTask(parseJwtStub)(req, res));

          case 8:
            // Check the results
            expect(parseJwtStub.calledOnceWithExactly(fakeToken)).to.be["true"];
            expect(res.status.calledOnceWithExactly(200)).to.be["true"];

          case 10:
          case "end":
            return _context.stop();
        }
      }
    });
  });
}); //#endregion
//#region /*** AUTH CONTROLLER ***/

/*
 * Test the /user/create POST route
 */

describe('/user/create', function () {
  it('should create a new user', function _callee2() {
    var req, res;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // Mock the request and response objects
            req = {
              body: {
                firstName: 'Mauro',
                lastName: 'Alberto',
                email: 'mauro@example.com',
                password: 'password123',
                role: 'Technician'
              }
            };
            res = {
              status: sinon.stub().returnsThis(),
              json: sinon.stub()
            }; // Call the createUser function with the mock request and response objects

            _context2.next = 4;
            return regeneratorRuntime.awrap(createUser(req, res));

          case 4:
            // Assert that the response was sent with the correct data
            expect(res.status.calledWith(OK)).to.be["true"];
            expect(res.json.calledWith({
              newUser: sinon.match.object
            })).to.be["true"];

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
});
/*
 * Test the authorizedTechnician middleware
 */

describe('authorizedTechnician', function () {
  it('should call next if the user is an authorized technician', function () {
    var token = 'fake_token';
    var req = {
      headers: {
        authorization: "Bearer ".concat(token)
      }
    };
    var res = {
      status: sinon.spy(),
      json: sinon.spy()
    };
    var next = sinon.spy();
    var parseJwtStub = sinon.stub().returns({
      role: TECHNICIAN
    });
    var middleware = authorizedTechnician(parseJwtStub);
    middleware(req, res, next);
    expect(parseJwtStub.calledOnceWithExactly(token)).to.be["true"];
    expect(next.called).to.be["true"];
    expect(res.status.called).to.be["false"];
    expect(res.json.called).to.be["false"];
  });
  it('should return unauthorized if the user is not an authorized technician', function () {
    var token = 'fake_token';
    var req = {
      headers: {
        authorization: "Bearer ".concat(token)
      }
    };
    var res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    var next = sinon.spy();
    var parseJwtStub = sinon.stub().returns({
      role: MANAGER
    });
    var middleware = authorizedTechnician(parseJwtStub);
    middleware(req, res, next);
    expect(parseJwtStub.calledOnceWithExactly(token)).to.be["true"];
    expect(next.called).to.be["false"];
    expect(res.status.calledOnceWith(401)).to.be["true"];
    expect(res.json.calledOnceWith({
      message: 'Unauthorized to access this page.'
    })).to.be["true"];
  });
  it('should return unauthorized if there is no token', function () {
    var req = {
      headers: {}
    };
    var res = {
      status: sinon.spy(function () {
        return res;
      }),
      json: sinon.spy()
    };
    var next = sinon.spy();
    var parseJwtStub = sinon.stub().returns({});
    var middleware = authorizedTechnician(parseJwtStub);
    middleware(req, res, next);
    expect(parseJwtStub.called).to.be["false"];
    expect(next.called).to.be["false"];
    expect(res.status.calledOnceWith(401)).to.be["true"];
    expect(res.json.calledOnceWith({
      message: 'Unauthorized to access this page.'
    })).to.be["true"];
  });
});
/*
 * Test the authorizedManager middleware
 */

describe('authorizedManager', function () {
  it('should call next if the user is an authorized technician', function () {
    var token = 'fake_token';
    var req = {
      headers: {
        authorization: "Bearer ".concat(token)
      }
    };
    var res = {
      status: sinon.spy(),
      json: sinon.spy()
    };
    var next = sinon.spy();
    var parseJwtStub = sinon.stub().returns({
      role: MANAGER
    });
    var middleware = authorizedManager(parseJwtStub);
    middleware(req, res, next);
    expect(parseJwtStub.calledOnceWithExactly(token)).to.be["true"];
    expect(next.called).to.be["true"];
    expect(res.status.called).to.be["false"];
    expect(res.json.called).to.be["false"];
  });
  it('should return unauthorized if the user is not an authorized manager', function () {
    var token = 'fake_token';
    var req = {
      headers: {
        authorization: "Bearer ".concat(token)
      }
    };
    var res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    var next = sinon.spy();
    var parseJwtStub = sinon.stub().returns({
      role: TECHNICIAN
    });
    var middleware = authorizedManager(parseJwtStub);
    middleware(req, res, next);
    expect(parseJwtStub.calledOnceWithExactly(token)).to.be["true"];
    expect(next.called).to.be["false"];
    expect(res.status.calledOnceWith(401)).to.be["true"];
    expect(res.json.calledOnceWith({
      message: 'Unauthorized to access this page.'
    })).to.be["true"];
  });
  it('should return unauthorized if there is no token', function () {
    var req = {
      headers: {}
    };
    var res = {
      status: sinon.spy(function () {
        return res;
      }),
      json: sinon.spy()
    };
    var next = sinon.spy();
    var parseJwtStub = sinon.stub().returns({});
    var middleware = authorizedManager(parseJwtStub);
    middleware(req, res, next);
    expect(parseJwtStub.called).to.be["false"];
    expect(next.called).to.be["false"];
    expect(res.status.calledOnceWith(401)).to.be["true"];
    expect(res.json.calledOnceWith({
      message: 'Unauthorized to access this page.'
    })).to.be["true"];
  });
});
/*
 * Test the login endpoint
 */

describe('/login', function () {
  afterEach(function () {
    sinon.restore();
  });
  it('should return 400 if email or password is missing', function _callee3() {
    var req, res;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            req = {
              body: {}
            }; //It returns the res object itself, so we can chain
            //without it we couldn't access the status or json result

            res = {
              status: sinon.spy(function () {
                return res;
              }),
              json: sinon.spy()
            };
            _context3.next = 4;
            return regeneratorRuntime.awrap(login(req, res));

          case 4:
            expect(res.status.calledOnceWith(400)).to.be["true"];
            expect(res.json.calledOnceWith({
              message: 'Invalid request. Missing parameters email or password.'
            })).to.be["true"];

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
  it('should return 404 if user not found', function _callee4() {
    var req, res, findOneStub;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            req = {
              body: {
                email: 'test@example.com',
                password: 'password'
              }
            };
            res = {
              status: sinon.spy(function () {
                return res;
              }),
              json: sinon.spy()
            }; //We simulate a findOne that returns null in order to simulate a user not found

            findOneStub = sinon.stub(User, 'findOne').returns(null);
            _context4.next = 5;
            return regeneratorRuntime.awrap(login(req, res));

          case 5:
            expect(findOneStub.calledOnceWith({
              where: {
                email: req.body.email
              }
            })).to.be["true"];
            expect(res.status.calledOnceWith(404)).to.be["true"];
            expect(res.json.calledOnceWith({
              message: 'User not found.'
            })).to.be["true"];

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
  it('should return 401 if incorrect password', function _callee5() {
    var req, res, findOneStub;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            req = {
              body: {
                email: 'test@example.com',
                password: 'password'
              }
            };
            res = {
              status: sinon.spy(function () {
                return res;
              }),
              json: sinon.spy()
            };
            findOneStub = sinon.stub(User, 'findOne').returns({
              password: bcrypt.hashSync('correct_password', 10)
            });
            _context5.next = 5;
            return regeneratorRuntime.awrap(login(req, res));

          case 5:
            expect(findOneStub.calledOnceWith({
              where: {
                email: req.body.email
              }
            })).to.be["true"];
            expect(bcrypt.compareSync(req.body.password, findOneStub().password)).to.be["false"];
            expect(res.status.calledOnceWith(401)).to.be["true"];
            expect(res.json.calledOnceWith({
              message: 'Incorrect Password.'
            })).to.be["true"];

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
  it('should return 200 and token if login successful', function _callee6() {
    var req, res, user, findOneStub, compareSyncStub, signStub;
    return regeneratorRuntime.async(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            req = {
              body: {
                email: 'test@example.com',
                password: 'password'
              }
            };
            res = {
              status: sinon.spy(function () {
                return res;
              }),
              json: sinon.spy()
            };
            user = {
              email: 'test@example.com',
              fullName: 'Test User',
              id: 123,
              role: 'user',
              password: bcrypt.hashSync('password', 10)
            };
            findOneStub = sinon.stub(User, 'findOne').returns(user);
            compareSyncStub = sinon.stub(bcrypt, 'compareSync').returns(true);
            signStub = sinon.stub(jwt, 'sign').returns('mocked_token');
            _context6.next = 8;
            return regeneratorRuntime.awrap(login(req, res));

          case 8:
            expect(findOneStub.calledOnceWith({
              where: {
                email: req.body.email
              }
            })).to.be["true"];
            expect(compareSyncStub.calledOnceWith(req.body.password, user.password)).to.be["true"];
            expect(signStub.calledOnceWith({
              email: user.email,
              fullName: user.fullName,
              id: user.id,
              role: user.role
            }, process.env.JWT_SECRET)).to.be["true"];
            expect(res.status.calledOnceWith(OK)).to.be["true"];

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    });
  });
}); //#endregion