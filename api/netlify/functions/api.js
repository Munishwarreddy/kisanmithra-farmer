const serverless = require('serverless-http');
const { app, connectDatabase } = require('../../server');

const handleRequest = serverless(app);
let databaseConnection;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  databaseConnection ||= connectDatabase();
  await databaseConnection;

  return handleRequest(event, context);
};
