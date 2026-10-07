const prisma = require('../lib/prisma');

const formatProject = (p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  status: p.status,
  start_date: p.startDate,
  end_date: p.endDate,
  created_at: p.createdAt,
  updated_at: p.updatedAt,
  task_count: p._count?.tasks,
  tasks: p.tasks?.map(formatTask),
});

const formatTask = (t) => ({
  id: t.id,
  project_id: t.projectId,
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
    const { search, status, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { userId: req.user.id };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: { _count: { select: { tasks: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects: projects.map(formatProject),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { tasks: { orderBy: { createdAt: 'desc' } } },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project: formatProject(project) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, status, start_date, end_date } = req.body;

    const project = await prisma.project.create({
      data: {
        userId: req.user.id,
        name,
        description: description || null,
        status: status || 'NOT_STARTED',
        startDate: start_date ? new Date(start_date) : null,
        endDate: end_date ? new Date(end_date) : null,
      },
    });

    res.status(201).json({ project: formatProject(project) });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const { name, description, status, start_date, end_date } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (start_date !== undefined) data.startDate = start_date ? new Date(start_date) : null;
    if (end_date !== undefined) data.endDate = end_date ? new Date(end_date) : null;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ project: formatProject(project) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
