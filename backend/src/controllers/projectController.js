import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, members } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Project title is required' });
  }

  const projectExists = await Project.findOne({ where: { title } });
  if (projectExists) {
    return res.status(400).json({ message: 'Project with this title already exists' });
  }

  let memberIds = members || [];
  if (typeof memberIds === 'string') {
    memberIds = [memberIds];
  }
  if (!memberIds.includes(req.user.id)) {
    memberIds.push(req.user.id);
  }

  const project = await Project.create({
    title,
    description,
    members: memberIds,
    createdBy: req.user.id
  });

  const creator = await User.findByPk(project.createdBy, { attributes: ['id', 'name', 'email'] });

  res.status(201).json({
    success: true,
    project: {
      id: project.id,
      _id: project.id,
      title: project.title,
      description: project.description,
      members: memberIds,
      createdBy: creator,
      taskCount: 0
    }
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.findAll({
    order: [['createdAt', 'DESC']]
  });

  const filteredProjects = req.user.role === 'admin'
    ? projects
    : projects.filter(p => {
        const memberIds = p.members || [];
        return memberIds.includes(req.user.id) || p.createdBy === req.user.id;
      });

  const projectsWithMembers = await Promise.all(
    filteredProjects.map(async (project) => {
      const memberIds = project.members || [];
      let members = [];
      if (memberIds.length > 0) {
        members = await User.findAll({
          where: { id: memberIds },
          attributes: ['id', 'name', 'email', 'role']
        });
      }
      const taskCount = await Task.count({ where: { project: project.id } });
      const creator = await User.findByPk(project.createdBy, { attributes: ['id', 'name', 'email'] });
      return {
        id: project.id,
        _id: project.id,
        title: project.title,
        description: project.description,
        members: members.map(m => ({ id: m.id, _id: m.id, name: m.name, email: m.email, role: m.role })),
        createdBy: creator,
        taskCount
      };
    })
  );

  res.json({
    success: true,
    projects: projectsWithMembers,
    count: projectsWithMembers.length
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const memberIds = project.members || [];
  const isMember = memberIds.includes(req.user.id) || project.createdBy === req.user.id;

  if (req.user.role !== 'admin' && !isMember) {
    return res.status(403).json({ message: 'Not authorized to view this project' });
  }

  const members = await User.findAll({
    where: { id: memberIds },
    attributes: ['id', 'name', 'email', 'role']
  });

  const creator = await User.findByPk(project.createdBy, { attributes: ['id', 'name', 'email'] });

  const tasks = await Task.findAll({
    where: { project: project.id },
    include: [
      { model: User, as: 'assignedToUser', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  const formattedTasks = tasks.map(task => ({
    id: task.id,
    _id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    assignedTo: task.assignedToUser ? { id: task.assignedToUser.id, name: task.assignedToUser.name } : null,
    createdBy: task.createdByUser ? { id: task.createdByUser.id, name: task.createdByUser.name } : null
  }));

  res.json({
    success: true,
    project: {
      id: project.id,
      _id: project.id,
      title: project.title,
      description: project.description,
      members: members.map(m => ({ id: m.id, _id: m.id, name: m.name, email: m.email, role: m.role })),
      createdBy: creator
    },
    tasks: formattedTasks
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const { title, description, members } = req.body;

  let project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.createdBy !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this project' });
  }

  if (title && title !== project.title) {
    const titleExists = await Project.findOne({ where: { title } });
    if (titleExists) {
      return res.status(400).json({ message: 'Project title already exists' });
    }
  }

  let memberIds = members;
  if (typeof memberIds === 'string') {
    memberIds = [members];
  }

  await project.update({ title, description, members: memberIds || project.members });

  const membersData = await User.findAll({
    where: { id: project.members || [] },
    attributes: ['id', 'name', 'email', 'role']
  });

  const creator = await User.findByPk(project.createdBy, { attributes: ['id', 'name', 'email'] });

  res.json({
    success: true,
    project: {
      id: project.id,
      _id: project.id,
      title: project.title,
      description: project.description,
      members: membersData.map(m => ({ id: m.id, _id: m.id, name: m.name, email: m.email, role: m.role })),
      createdBy: creator
    }
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.createdBy !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this project' });
  }

  await Task.destroy({ where: { project: project.id } });
  await project.destroy();

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
});
