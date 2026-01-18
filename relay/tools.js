const tools = [
  {
    name: "log_fact",
    description: "Log important user information for interview notes",
    parameters: {
      type: "OBJECT",
      properties: {
        fact: {
          type: "STRING",
          description: "Raw user statement"
        }
      },
      required: ["fact"]
    }
  }
];

module.exports = { tools };
