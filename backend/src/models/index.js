import User from './User.js';
import Project from './Project.js';
import Task from './Task.js';
import ProjectMember from './ProjectMember.js';

User.hasMany(Project, { as: 'createdProjects', foreignKey: 'createdBy' });
Project.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

Project.hasMany(ProjectMember, { as: 'memberships', foreignKey: 'projectId' });
User.hasMany(ProjectMember, { as: 'projectMemberships', foreignKey: 'userId' });
ProjectMember.belongsTo(User, { as: 'user', foreignKey: 'userId' });
ProjectMember.belongsTo(User, { as: 'addedByUser', foreignKey: 'addedBy' });

Project.belongsToMany(User, { through: ProjectMember, as: 'projectMembers', foreignKey: 'projectId', otherKey: 'userId' });
User.belongsToMany(Project, { through: ProjectMember, as: 'userProjects', foreignKey: 'userId', otherKey: 'projectId' });

Task.belongsTo(User, { as: 'assignedToUser', foreignKey: 'assignedTo' });
Task.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });
Task.belongsTo(Project, { as: 'projectData', foreignKey: 'project' });

User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assignedTo' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdBy' });
Project.hasMany(Task, { as: 'tasks', foreignKey: 'project' });

export { User, Project, Task, ProjectMember };
