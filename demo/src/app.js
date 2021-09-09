const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const csurf = require('csurf')
const express = require('express')
const { UniqueViolationError } = require('objection')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { callbackify, promisify } = require('util')

const { expressify, validateBody, ValidationError } = require('./util')
const User = require('./models/user')

const app = express()

// TODO
// refactor?
// introduce i18n for translation strings?

app.set('view engine', 'pug')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

if (!process.env.SESSION_SECRET) throw new Error('no session secret')
app.use(
  cookieSession({
    keys: process.env.SESSION_SECRET.split(','),
  })
)

app.use((req, res, next) => {
  req.session.extendedFrom = Math.floor(Date.now() / 60e3)
  next()
})

app.use(csurf())

const BAD_USERNAME_MESSAGE =
  "Sorry, we don't recognize that email address. Please check for typos or register first."
const BAD_PASSWORD_MESSAGE =
  "Sorry, that password doesn't match. Please try again."

async function verify(username, password) {
  const user = await User.query()
    .whereRaw('lower(email) = lower(?)', username)
    .first()

  if (!user)
    return {
      user: false,
      info: { message: BAD_USERNAME_MESSAGE },
    }

  const rightPassword = await bcrypt.compare(password, user.passwordDigest)
  if (rightPassword) {
    return { user }
  } else {
    return { user: false, info: { message: BAD_PASSWORD_MESSAGE } }
  }
}

passport.use(
  new LocalStrategy((username, password, done) => {
    verify(username, password)
      .then(({ user, info }) => {
        done(null, user, info)
      })
      .catch((err) => {
        done(err)
      })
  })
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

async function deserializeUser(id) {
  const user = await User.query().findById(id)
  return user || null // (strict) null is interpreted as not found
}

passport.deserializeUser(callbackify(deserializeUser))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  res.locals.user = req.user
  next()
})

app.get('/', (req, res) => {
  console.log(process.env.PGDATABASE)
  res.render('index')
})

// Is the service up?
app.get('/status', (req, res) => res.sendStatus(204))

const SALT_ROUNDS = 10
const DEFAULT_REGISTER_LOCALS = { User }

app.get('/register', (req, res) => {
  if (req.user) return res.redirect('/')
  res.render('register', DEFAULT_REGISTER_LOCALS)
})

app.post(
  '/register',
  validateBody({
    properties: {
      _csrf: { type: 'string' },
      username: User.EMAIL_SCHEMA,
      password: User.PASSWORD_SCHEMA,
    },
    required: ['username', 'password'],
    additionalProperties: false,
  }),
  expressify(async (req, res) => {
    const passwordDigest = await bcrypt.hash(req.body.password, SALT_ROUNDS)
    const user = await User.query().insert({
      email: req.body.username,
      passwordDigest,
    })
    console.log(user)
    await promisify(req.login).bind(req)(user)
    res.redirect('/')
  }),
  (err, req, res, next) => {
    if (res.headersSent) return next(err)
    let errors
    if (err instanceof UniqueViolationError) {
      errors = ['Already registered. Please try logging in!']
    } else if (err instanceof ValidationError) {
      errors = err.errors.map((error) => `${error.dataPath} ${error.message}`)
    }
    if (!errors) return next(err)
    res.status(422).render('register', {
      ...DEFAULT_REGISTER_LOCALS,
      errors,
      email: req.body.username,
    })
  }
)

app.get('/login', (req, res) => {
  if (req.user) return res.redirect('/')
  res.render('login')
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      res.status(401).render('login', { errors: [info.message] })
      return
    }
    req.login(user, (err) => {
      if (err) return next(err)
      res.redirect('/login')
    })
  })(req, res, next)
})

app.get('/logout', (req, res) => {
  res.render('logout')
})

app.post('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = app
