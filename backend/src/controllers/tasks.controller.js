const prisma = require('../lib/prisma');

const formatTask = (t) => ({
  id: t.id,
  project_id: t.projectId,
  project: t.project ? { id: t.project.id, name: t.project.name } : undefined,
  name: t.name,
  description: t.description,
  priority: t.priority,
  status: t.status,
  due_date: t.dueDate,
  created_at: t.createdAt,
  updated_at: t.updatedAt,
});

const getAll = async (req, res, next) => {
  try {
    const { search, status, priority, projectId, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { project: { userId: req.user.id } };
    if (projectId) where.projectId = projectId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { project: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.task.count({ where }),
    ]);

    res.json({ tasks: tasks.map(formatTask), total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.user.id } },
      include: { project: { select: { id: true, name: true } } },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { project_id, name, description, priority, status, due_date } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: project_id, userId: req.user.id },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        projectId: project_id,
        name,
        description: description || null,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: due_date ? new Date(due_date) : null,
      },
      include: { project: { select: { id: true, name: true } } },
    });

    res.status(201).json({ task: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.user.id } },
    });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const { name, description, priority, status, due_date } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;
    if (due_date !== undefined) data.dueDate = due_date ? new Date(due_date) : null;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: { project: { select: { id: true, name: true } } },
    });

    res.json({ task: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.user.id } },
    });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
