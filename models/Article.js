const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'image'] },
  content: String, 
})

const articleSchema = new mongoose.Schema({
  title_cs: String,
  title_en: String,
  perex_cs: String,
  perex_en: String,
  blocks_cs: [blockSchema], 
  blocks_en: [blockSchema], 
  img: String,              
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Article', articleSchema)