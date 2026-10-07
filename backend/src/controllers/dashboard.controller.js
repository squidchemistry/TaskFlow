const prisma = require('../lib/prisma');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: 'COMPLETED' } }),
      prisma.task.count({ where: { project: { userId }, status: 'PENDING' } }),
    ]);

    res.json({
      total_projects: totalProjects,
      projects_in_progress: projectsInProgress,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
