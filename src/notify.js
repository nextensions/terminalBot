import request from 'request'
import dotenv from 'dotenv'
import moment from 'moment'
import { Pool, Client } from 'pg'
import 'moment-timezone'

require('moment/locale/th')

dotenv.load()
const { TITLE, LINETOKEN, PG_CONNECTION_STRING } = process.env
const connectionString = PG_CONNECTION_STRING

const pool = new Pool({
  connectionString,
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const query = {
  text: `SELECT
          t.tid,
          sch.name,
          t.note
          FROM
          terminal t
          INNER JOIN school sch ON sch.id = t.school_id
          WHERE
              t.school_id NOT IN (132, 126, 3, 5, 34)
              AND t.type = 0
              AND t.status = 0
              AND sch.status = $1
              AND (model NOT LIKE 'fc%'
                  OR model IS NULL)
          ORDER BY
            sch.name`,
  values: [10],
}

const message = []
pool.connect().then(client =>
  client
    .query(query)
    .then((res) => {
      const lastSend = res.rows.map(terminal =>
        client
          .query({
            text: `SELECT
                        MAX(created_at) AS created_at,
                        terminal_id,
                        $2 AS school
                    FROM (
                        (SELECT created_at, terminal_id FROM terminal_log WHERE terminal_id = $1 ORDER BY id DESC LIMIT 1 )
                        UNION
                        (SELECT created_at, terminal_id FROM clock_in WHERE terminal_id = $1 ORDER BY id DESC LIMIT 1)
                    ) AS result GROUP BY terminal_id`,
            values: [terminal.tid, terminal.name],
          })
          .then(promise => promise)
          .catch((e) => {
            console.log(e.stack)
          }))
      return lastSend
    })
    .then((promise) => {
      Promise.all(promise).then((results) => {
        const msg = results.map((log) => {
          const pass5MinTime = moment()
            .subtract(5, 'minute')
            .tz('Asia/Bangkok')
          const lastSendTime = moment(log.rows[0].created_at).tz('Asia/Bangkok')
          const terminalId = log.rows[0].terminal_id
          const schoolName = log.rows[0].school

          if (lastSendTime && lastSendTime < pass5MinTime) {
            message.push(`${schoolName} terminal เบอร์ ${terminalId} เครื่องแดง, ใช้งานได้ล่าสุดเมื่อ ${lastSendTime.format('Do MMMM YYYY เวลา H:mm:ss')}`)
          }
        })
        console.log(message)
        client.release()
      })
    })
    .catch((e) => {
      client.release()
      console.log(e.stack)
    }))
