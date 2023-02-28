const { INTERNAL_SERVER_ERROR, OK } = require('http-status');
const Task = require('../models/Task');
const { v4: uuidv4 } = require('uuid');
const { parseJwt } = require('../utils/encryption');
const TECHNICIAN = 'Technician';
const MANAGER = 'Manager';

exports.fetchAllTask = [
  async (req, res, next) => {
    const token = req.headers?.authorization.replace('Bearer ', '');
    const result = token && parseJwt(token);
    if (token && result.role === MANAGER) {
      try {
        const tasks = await Task.findAll();
        return res.status(OK).json({
          tasks,
        });
      } catch (error) {
        console.error('Error getting tasks:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
          message: 'Error getting tasks',
          errors: error?.errors,
        });
      }
    } else if (token && result.role === TECHNICIAN) {
      try {
        var condition = { where: { userId: result.id } };
        const tasks = await Task.findAll(condition);
        return res.status(OK).json({
          tasks,
        });
      } catch (error) {
        console.error('Error getting tasks:', error);
        return res.status(INTERNAL_SERVER_ERROR).json({
          message: 'Error getting tasks',
          errors: error?.errors,
        });
      }
    }
  },
];

exports.createTask = [
  async (req, res, next) => {
    const token = req.headers?.authorization.replace('Bearer ', '');
    const result = parseJwt(token);
    const { id } = result;
    try {
      // Saving an user
      const { summary } = req.body;
      const newTask = await Task.create({
        summary: summary,
        userId: id,
        id: uuidv4(),
      });

      return res.status(OK).json({
        newTask,
      });
    } catch (error) {
      console.error('Error inserting task properties:', error);
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: 'Error inserting task properties',
        errors: error?.errors,
      });
    }
  },
];

exports.updateTask = [
  async (req, res, next) => {
    const token = req.headers?.authorization.replace('Bearer ', '');
    const result = parseJwt(token);
    const { id } = result;
    try {
      // Saving an user
      const { taskId, summary } = req.body;

      var values = { summary: summary };
      var condition = { where: { userId: id, id: taskId } };
      options = { multi: true };
      const updatedTask = await Task.update(values, condition, options);

      return res.status(OK).json({
        updatedTask,
      });
    } catch (error) {
      console.error('Error inserting task properties:', error);
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: 'Error inserting task properties',
        errors: error?.errors,
      });
    }
  },
];

exports.deleteTask = [
  async (req, res, next) => {
    try {
      // Saving an user
      const { taskId } = req.body;
      var condition = { where: { id: taskId } };
      _ = await Task.destroy(condition);

      return res.status(OK).json('A Task was sucessfully deleted');
    } catch (error) {
      console.error('Error inserting task properties:', error);
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: 'Error inserting task properties',
        errors: error?.errors,
      });
    }
  },
];
