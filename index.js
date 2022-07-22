const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

// надо исправить на токен бота самого главного
const TOKEN = "5587543963:AAFZizEfYIF3lWv6ID31AJZ6TZwYJxig3dU";
const server = express();
const bot = new TelegramBot(TOKEN, {
    polling: true
});
const port = process.env.PORT || 5000;

// надо исправить на имя для URL
const gameName = "short_name_for_your_game";
const queries = {};

// надо поменять на имя корневой папки в которой находится этот файл 
server.use(express.static(path.join(__dirname, 'mk-game-test-index')));
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements a T-Rex jumping game. Say /game if you want to play."));
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;

// надо поменять на ссылку pages саму игру в организации
        let gameurl = "https://munchkin-game.github.io/mk-game-test/";
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});
bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]);
});
server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) {});
});
server.listen(port);