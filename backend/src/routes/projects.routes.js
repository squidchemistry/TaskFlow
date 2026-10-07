const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/projects.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.schema');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', validate(createProjectSchema), create);
router.put('/:id', validate(updateProjectSchema), update);
router.delete('/:id', remove);

module.exports = router;
