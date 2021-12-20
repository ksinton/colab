const sql = require("./db.js")

const Model = {}

Model.createMutation = (mutation, result) => {
    sql.query("INSERT INTO mutations SET ?", mutation, (err, res) => {
        if (err) {
            console.log("error: ", err)
            result(err, null)
            return
        }

        console.log("created mutation: ", { id: res.insertId, ...mutation })
        result(null, { id: res.insertId, ...mutation })
    })
}

Model.getConversation = (conversationId, result) => {
    sql.query(`SELECT * FROM conversations WHERE id = ${conversationId}`, (err, res) => {
        if (err) {
            console.log("error: ", err)
            result(err, null)
            return
        }

        if (res.length) {
            console.log("found conversation: ", res[0])
            result(null, res[0])
            return
        }

        result({kind: "not_found"}, null)
    })
}

Model.getConversations = (result) => {
    sql.query('SELECT * FROM conversations', (err, res) => {
        if (err) {
            console.log("error: ", err)
            result(err, null)
            return
        }

        if (res.length) {
            console.log("found conversations: ", res)
            result(null, res)
            return
        }

        result({kind: "not_found"}, null)
    })
}

Model.updateConversation = (conversation, result) => {
    sql.query(`UPDATE conversations SET text = '${conversation.text}', lastMutation = ${conversation.lastMutation} WHERE id = ${conversation.id}`, (err, res) => {
        if (err) {
            console.log("error: ", err)
            result(err, null)
            return
        }

        console.log("updated conversation: ", {...conversation })
        result(null, {...conversation })
    })
}

module.exports = Model