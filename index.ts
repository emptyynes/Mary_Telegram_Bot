import { Mary } from "@mary/core";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "bun";
import { WhiteLits } from "./whiteList"; 
import { SPECIAL_CHARS } from "./SPECIAL_CHARS";


import type { MaryConfig } from "@mary/core";

const Bot =  new Telegraf(env.BotToken)

const  config :MaryConfig = {
  thoughtsArray: ['mixtral-8x7b-instruct', 'llama-3.1-8b-instruct'],
  chapter: 'gpt-4o-mini',
  creatorImagePrompt: 'llama-3.1-8b-instruct',
}




const escapeMarkdown = (text: string) => {
  let answer = text
  SPECIAL_CHARS.forEach(char => (answer =  answer.replaceAll(char, `\\${char}`))) 
  console.log(answer)
  return answer
}
Bot.on(message('text'), async (ctx) => {
   const  chatId = ctx.message.chat.id
   const isWhitelisted = WhiteLits.some((id) => id === chatId)
   const isGroup = ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
   const question = ctx.message.text.toLowerCase() 
   if (isWhitelisted || (isGroup && (isWhitelisted || question.includes('мари')))) {
    console.log('id in whiteList')
    const mary = new Mary(config, question, chatId.toString(), ctx.from.username ?? '', chatId.toString())
    if (question.includes('нарисуй')) {
      console.log('рисую изображение')
      const  answer = await mary.ImageGenerator()
      await ctx.telegram.sendMessage(chatId, escapeMarkdown(answer), { parse_mode: 'MarkdownV2' })
    } else {
      const answer = await mary.Request()
      await ctx.telegram.sendMessage(chatId, escapeMarkdown(answer), { parse_mode: 'MarkdownV2' })
    }
  } else {
    console.log('id not whiteList')
    if (!isGroup) {
      await ctx.telegram.sendMessage(chatId, 'Прости но я не могу тебе ответить')
    }  
  }
})

Bot.launch()
