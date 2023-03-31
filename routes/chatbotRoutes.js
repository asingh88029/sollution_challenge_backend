const express = require("express");
const router = express.Router();
const chatbotController = require('./../controller/chatbotController');

router.post('/query',chatbotController.talkToChatbot);

router.post('/query/askgpt',chatbotController.askToGPT)

module.exports = router