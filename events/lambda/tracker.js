const { join } = require("path")
require("dotenv").config({
  path: join(__dirname, ".env"),
})

const AWS = require("aws-sdk")

exports.writeEventToS3 = async event => {
  const s3 = new AWS.S3()
  const bucketName = `tu-berlin-isis-course-crawler-events${event.dev ? "-test" : ""}`
  const fileName = "events.csv"
  const getParams = {
    Bucket: bucketName,
    Key: fileName,
  }
  const res = await s3.getObject(getParams).promise()
  let eventCsv = res.Body.toString()

  const pad = n => (n < 10 ? `0${n}` : n)
  const now = new Date()
  const date = `${pad(now.getDate())}-${pad(now.getMonth())}-${now.getFullYear()}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const newEvent = `${event.event};${date};${time};${event.browser};${event.browserId}\n`
  eventCsv += newEvent

  const putParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: Buffer.from(eventCsv),
  }
  await s3.putObject(putParams).promise()
  return eventCsv
}

const TelegramBot = require("node-telegram-bot-api")

const token = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.DEV_CHAT_ID

const bot = new TelegramBot(token, { polling: true })
exports.sendBotMessage = async event => {
  await bot.sendMessage(chatId, JSON.stringify(event, null, 2))
}
