const express = require("express")
const cors = require("cors")
const Model = require("./model.js")
const app = express()
const padEnd = require('string.prototype.padend')

var corsOptions = {
    origin: [
        "http://localhost:5000",
        "https://web.ava.me"
    ]
}

app.use(cors(corsOptions))

// parse requests of content-type - application/json
app.use(express.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to bezkoder application." })
})

app.get('/ping', function (req, res, next) {
    res.send({
        "ok": true,
        "msg": "pong"
    })
    next()
})

app.get('/info', function (req, res, next) {
    res.send({
        "ok": true,
        "author": {
            "email": "kimsinton@gmail.com",
            "name": "Kim Sinton"
        },
        "frontend": {
            "url": "in progres"
        },
        "language": "node.js",
        "sources": "https://github.com/ksinton/colab"
    })
    next()
})

app.post('/mutations', function (req, res, next) {

    // Validate request
    if (!req.body) {
        res.status(400).send({
            ok: false,
            message: "Content can not be empty!"
        })
        return
    } else if (!req.body.author
        || !req.body.conversationId
        || !req.body.type
        || !req.body.startIndex
        || !req.body.length
        || !req.body.text )  {

        res.status(400).send({
            ok: false,
            message: "Incorrect post data sent"
        })
        return
    }

    const mutation = {
        "author" : req.body.author,
        "conversationId" : req.body.conversationId,
        "type" : req.body.type,
        "startIndex" : req.body.startIndex,
        "length" : req.body.length,
        "text" : req.body.text
    }

    Model.createMutation(mutation, (err, mutationData) => {
        if (err)
            res.status(500).send({
                ok: false,
                message:
                    err.message || "Some error occurred while creating the Mutation."
            })
        else {
            Model.getConversation(1, (err, data) => {
                if (err)
                    res.status(500).send({
                        ok: false,
                        message:
                            err.message || "Some error occurred while retrieving the conversation"
                    })
                else {
                    let conversationId = data.id
                    let conversationText = data.text

                    switch(mutationData.type) {
                        case 'insert':

                            if (conversationText.length < (mutationData.startIndex + mutationData.length)) {
                                conversationText = padEnd(conversationText,mutationData.startIndex + mutationData.length,' ')
                            }

                            conversationText = [conversationText.slice(0, mutationData.startIndex), mutationData.text, conversationText.slice(mutationData.startIndex)].join('')
                            break
                        case 'delete':
                            conversationText = [conversationText.slice(0, mutationData.startIndex), conversationText.slice(mutationData.startIndex + mutationData.length) ].join('')
                            break
                        default:
                            res.status(400).send({
                                ok: false,
                                message: "Unknown mutation type"
                            })
                            return
                    }

                    Model.updateConversation({id: conversationId, text: conversationText, lastMutation: mutationData.id }, (err, newConversationData) => {
                        if (err)
                            res.status(500).send({
                                ok: false,
                                message:
                                    err.message || "Some error occurred while updating the conversation."
                            })
                        else {
                            res.status(201).send({
                                "ok": true,
                                "text": conversationText
                            })
                        }
                    })
                }
            })
        }
    })
})

app.get('/conversations', function (req, res, next) {

    Model.getConversation(1, (err, data) => {
        if (err)
            res.status(500).send({
                ok: false,
                message:
                    err.message || "Some error occurred while retrieving the conversation"
            })
        else {
            res.send({
                "ok": true,
                "conversations": data
            })
        }
    })
})

app.get('/favico.ico', (req, res, next) => {
    res.sendStatus(404)
    next()
})

// set port, listen for requests
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})
