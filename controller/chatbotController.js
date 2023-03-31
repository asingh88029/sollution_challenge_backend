const dialogflow = require("@google-cloud/dialogflow");
const { Configuration, OpenAIApi } = require("openai");
const path = require("path");
const uuid = require("uuid");
const keys = require("./../config/keys");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// A unique identifier for the given session
const sessionId = uuid.v4();

// projectId of Google Cloud
const projectId = keys.Google_Cloud.Project_Id;

async function talkToChatbot(req, res, next) {
  const message = req.body.message;

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: path.join(
      __dirname,
      "./../config/easykart-bot-pafi-81900cf6323d.json"
    ),
  });

  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  console.log("message: " + message);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: message,
        // The language used by the client (en-US)
        languageCode: "en-US",
      },
    },
  };

  const response = await sessionClient
    .detectIntent(request)
    .then((responses) => {
      console.log(JSON.stringify(responses));
      const requiredResponse = responses[0].queryResult;
      console.log(requiredResponse);
      res.send({
        message: requiredResponse,
      });
    })
    .catch((error) => {
      console.log("ERROR: " + error);
      res.send({
        error: "Error occured here",
      });
    });
}

async function askToGPT(req, res, next) {
  const message = req.body.message;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Tell me disease from the text.\ntext: " + message + ".",
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let answer = response.data.choices[0].text;

  answer = answer.split(":");

  answer = answer.slice(-1)[0];

  var newstr = "";
  for (var i = 0; i < answer.length; i++)
    if (!(answer[i] == "\n" || answer[i] == "\r")) newstr += answer[i];

  res.send({
    result: newstr,
  });
}

module.exports = {
  talkToChatbot,
  askToGPT,
};
