const { nanoid } = require('nanoid');

const generateId = (prefix) => `${prefix}-${nanoid(16)}`;

module.exports = { generateId };
