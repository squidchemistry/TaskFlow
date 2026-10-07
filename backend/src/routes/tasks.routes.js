const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.schema');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', validate(createTaskSchema), create);
router.put('/:id', validate(updateTaskSchema), update);
router.delete('/:id', remove);

module.exports = router;
