const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title_cs: String,
  title_en: String,
  perex_cs: String,
  perex_en: String,
  content_cs: String,
  content_en: String,
  img: String,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Article', articleSchema)