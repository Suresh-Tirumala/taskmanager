import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sequelize } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Op, fn, col } from 'sequelize';

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findByPk(projectId);
  if (!project) return false;
  if (project.createdBy === userId) return true;
  
  const memberIds = project.members || [];
  return memberIds.includes(userId) || memberIds.includes(userId.toString());
};

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, dueDate, project: projectId } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  if (!projectId) {
    return res.status(400).json({ message: 'Project is required' });
  }

  const project = await Project.findByPk(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isMember = await isProjectMember(projectId, req.user.id);
  if (req.user.role !== 'admin' && !isMember) {
    return res.status(403).json({ message: 'Not authorized to create task in this project' });
  }

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo || null,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    project: projectId,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    task: {
      id: task.id,
      _id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo || null,
      createdBy: { id: req.user.id }
    }
  });
});

export const getTasks = asyncHandler(async (req, res) => {
  const { project, status, priority, assignedTo, search, sort, page = 1, limit = 20 } = req.query;

  const isAdmin = req.user.role === 'admin';
  let whereClause = {};
  let projectFilter = {};

  if (!isAdmin) {
    const allProjects = await Project.findAll();
    const memberProjectIds = allProjects
      .filter(p => {
        const memberIds = p.members || [];
        return p.createdBy === req.user.id || 
               memberIds.includes(req.user.id) || 
               memberIds.includes(req.user.id.toString());
      })
      .map(p => p.id);

    if (memberProjectIds.length === 0) {
      memberProjectIds.push(-1);
    }

    projectFilter = {
      [Op.or]: [
        { project: memberProjectIds },
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]
    };
  }

  if (project) {
    whereClause.project = parseInt(project);
  } else if (!isAdmin) {
    whereClause = projectFilter;
  }

  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (assignedTo) whereClause.assignedTo = parseInt(assignedTo);

  if (search) {
    const searchCondition = {
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };
    whereClause = { ...whereClause, ...searchCondition };
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'dueDate') order = [['dueDate', 'ASC']];
  if (sort === 'priority') order = [['priority', 'DESC']];

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: tasks } = await Task.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'assignedToUser', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email'] },
      { model: Project, as: 'projectData', attributes: ['id', 'title'] }
    ],
    order,
    limit: parseInt(limit),
    offset
  });

  const formattedTasks = tasks.map(task => ({
    id: task.id,
    _id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    assignedTo: task.assignedToUser ? { id: task.assignedToUser.id, name: task.assignedToUser.name, email: task.assignedToUser.email } : null,
    createdBy: task.createdByUser ? { id: task.createdByUser.id, name: task.createdByUser.name } : null,
    project: task.projectData ? { id: task.projectData.id, _id: task.projectData.id, title: task.projectData.title } : null
  }));

  res.json({
    success: true,
    tasks: formattedTasks,
    total: count,
    page: parseInt(page),
    pages: Math.ceil(count / parseInt(limit))
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findByPk(req.params.id, {
    include: [
      { model: User, as: 'assignedToUser', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email'] },
      { model: Project, as: 'projectData', attributes: ['title', 'createdBy', 'members'] }
    ]
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const memberIds = task.projectData.members || [];
  const isMember = task.projectData.createdBy === req.user.id || 
                   memberIds.includes(req.user.id) || 
                   memberIds.includes(req.user.id.toString());

  if (req.user.role !== 'admin' && !isMember) {
    return res.status(403).json({ message: 'Not authorized to view this task' });
  }

  res.json({
    success: true,
    task: {
      ...task.toJSON(),
      assignedTo: task.assignedToUser,
      createdBy: task.createdByUser,
      project: { _id: task.project, title: task.projectData.title }
    }
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, status, dueDate, project: projectId } = req.body;

  let task = await Task.findByPk(req.params.id, {
    include: [{ model: Project, as: 'projectData' }]
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const isAdmin = req.user.role === 'admin';
  const isCreator = task.createdBy === req.user.id;
  const isAssignee = task.assignedTo === req.user.id;

  if (!isAdmin && !isCreator && !isAssignee) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  if (projectId && projectId !== task.project) {
    const newProject = await Project.findByPk(projectId);
    if (!newProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = await isProjectMember(projectId, req.user.id);
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Not authorized to move task to this project' });
    }
  }

  await task.update({
    title,
    description,
    assignedTo,
    priority,
    status,
    dueDate,
    project: projectId
  });

  const updatedTask = await Task.findByPk(task.id, {
    include: [
      { model: User, as: 'assignedToUser', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email'] },
      { model: Project, as: 'projectData', attributes: ['title'] }
    ]
  });

  res.json({
    success: true,
    task: {
      ...updatedTask.toJSON(),
      assignedTo: updatedTask.assignedToUser,
      createdBy: updatedTask.createdByUser,
      project: { _id: updatedTask.project, title: updatedTask.projectData?.title }
    }
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const isAdmin = req.user.role === 'admin';
  const isCreator = task.createdBy === req.user.id;

  if (!isAdmin && !isCreator) {
    return res.status(403).json({ message: 'Not authorized to delete this task' });
  }

  await task.destroy();

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.findAll({
    where: { assignedTo: req.user.id },
    include: [
      { model: Project, as: 'projectData', attributes: ['id', 'title'] },
      { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: 10
  });

  const formattedTasks = tasks.map(task => ({
    id: task.id,
    _id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    project: task.projectData ? { id: task.projectData.id, _id: task.projectData.id, title: task.projectData.title } : null,
    createdBy: task.createdByUser ? { id: task.createdByUser.id, name: task.createdByUser.name } : null
  }));

  res.json({
    success: true,
    tasks: formattedTasks
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role?.toLowerCase() || 'member';
  const isAdmin = role === 'admin';

  let projects = [];
  try {
    if (isAdmin) {
      projects = await Project.findAll();
    } else {
      // Fetch all projects and filter by owner or membership in JSON field
      // This matches the logic in projectController.js
      const allProjects = await Project.findAll();
      projects = allProjects.filter(p => {
        const memberIds = p.members || [];
        // Ensure comparison works regardless of ID type (string vs number)
        return p.createdBy === userId || 
               memberIds.includes(userId) || 
               memberIds.includes(userId.toString());
      });
    }
  } catch (err) {
    console.error('Error fetching projects for stats:', err);
  }

  const projectIds = projects.map(p => p.id);

  let taskQuery = {};
  if (!isAdmin) {
    if (projectIds.length > 0) {
      taskQuery = { project: { [Op.in]: projectIds } };
    } else {
      taskQuery = { project: -1 };
    }
  }

  let totalTasks = 0, completedTasks = 0, pendingTasks = 0, overdueTasks = 0, myTasksCount = 0;
  try {
    totalTasks = await Task.count({ where: taskQuery });
    completedTasks = await Task.count({ where: { ...taskQuery, status: 'completed' } });
    pendingTasks = await Task.count({
      where: {
        ...taskQuery,
        status: { [Op.ne]: 'completed' }
      }
    });

    const now = new Date();
    overdueTasks = await Task.count({
      where: {
        ...taskQuery,
        status: { [Op.ne]: 'completed' },
        dueDate: { [Op.lt]: now }
      }
    });

    myTasksCount = await Task.count({
      where: {
        assignedTo: userId,
        status: { [Op.ne]: 'completed' }
      }
    });
  } catch (err) {
    console.error('Error fetching basic counts:', err);
  }

  let statusDistribution = [], priorityDistribution = [];
  try {
    const statusDistRaw = await Task.findAll({
      where: taskQuery,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    statusDistribution = statusDistRaw.map(r => ({
      _id: r.status || 'todo',
      count: parseInt(r.count || r['count'] || Object.values(r)[1] || 0)
    }));

    const priorityDistRaw = await Task.findAll({
      where: taskQuery,
      attributes: ['priority', [fn('COUNT', col('id')), 'count']],
      group: ['priority'],
      raw: true
    });

    priorityDistribution = priorityDistRaw.map(r => ({
      _id: r.priority || 'medium',
      count: parseInt(r.count || r['count'] || Object.values(r)[1] || 0)
    }));
  } catch (err) {
    console.error('Error fetching distributions:', err);
  }

  let completionTrend = [];
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendRaw = await Task.findAll({
      where: {
        ...taskQuery,
        status: 'completed',
        updatedAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [fn('DATE', col('updatedAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('updatedAt'))],
      order: [[fn('DATE', col('updatedAt')), 'ASC']],
      raw: true
    });

    completionTrend = trendRaw.map(r => ({
      date: r.date || Object.values(r)[0],
      count: parseInt(r.count || r['count'] || Object.values(r)[1] || 0)
    }));
  } catch (err) {
    console.error('Error fetching trend:', err);
  }

  let formattedRecentTasks = [];
  try {
    const recentTasks = await Task.findAll({
      where: taskQuery,
      include: [
        { model: User, as: 'assignedToUser', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'projectData', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    formattedRecentTasks = recentTasks.map(task => ({
      id: task.id,
      _id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedToUser ? { id: task.assignedToUser.id, name: task.assignedToUser.name } : null,
      createdBy: task.createdByUser ? { id: task.createdByUser.id, name: task.createdByUser.name } : null,
      project: task.projectData ? { id: task.projectData.id, title: task.projectData.title } : null,
      createdAt: task.createdAt
    }));
  } catch (err) {
    console.error('Error fetching recent tasks:', err);
  }

  res.json({
    success: true,
    stats: {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      myTasks: myTasksCount,
      statusDistribution,
      priorityDistribution,
      completionTrend,
      recentTasks: formattedRecentTasks
    }
  });
});
