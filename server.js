//server.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')

const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const { requireAuth, checkUser } = require('./middleware/authMiddleware')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
const authRouter = require('./routes/auth')
const authLogin = require('./routes/auth')
const authSignup = require('./routes/auth')


const cookieParser = require('cookie-parser')

app.use(cookieParser())

// Middleware для визначення поточної URL-адреси
app.use((req, res, next) => {
  res.locals.currentPath = req.path
  next()
})

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')


app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.get('*', checkUser)
app.use('/', authRouter)
app.use('/signup', authSignup)
app.use('/login', authLogin)

app.use('/library', requireAuth, indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.get('/set-cookies', (req, res) => {
  res.cookie('newUser', false)
  res.cookie('isEmployee', true, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true })
  res.send('you got the cookies!')
})

app.get('/read-cookies', (req, res) => {
  const cookies = req.cookies
  console.log(cookies.newUser)
  res.json(cookies)
})

app.listen(process.env.PORT || 3000)