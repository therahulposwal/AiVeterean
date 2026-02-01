// relay/tools.js

// Define the tool structure according to Gemini API specs
const tools = [
  {
    functionDeclarations: [
      {
        name: "log_interview_fact",
        description: "Log a key fact or extracted information from the user's interview answers.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "The category of the fact (e.g., 'Experience', 'Leadership', 'Skills')."
            },
            fact: {
              type: "STRING",
              description: "The extracted fact or summary of what the user said."
            }
          },
          required: ["category", "fact"]
        }
      }
    ]
  }
];

module.exports = { tools };