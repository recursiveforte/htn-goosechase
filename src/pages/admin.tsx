import { Challenge, User } from '@prisma/client'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Props = {}

type FullUser = User & {
  score: number
  taggings: Challenge[]
  tags: Challenge[]
}

const Admin = (props: Props) => {
  const [users, setUsers] = useState<FullUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<FullUser[]>([])
  const [password, setPassword] = useState("")
  const router = useRouter()

  const [textMessage, setTextMessage] = useState(`
a challenge begins in ${process.env.NEXT_PUBLIC_LOCATION}.

find the target ASAP and scan their badge with goosechase.club to earn points.

you will be greatly rewarded. (or reply STOP to leave the game forever)
  `.trim());

  useEffect(() => {
    fetch('/api/user/get_all')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setFilteredUsers(data)
      })
  }, [])

  useEffect(() => {
    const password = router.query.password as string ?? ""
    setPassword(password)
  }, [router])
  

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin (count: {users.length})</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Name"
          className="search-input"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase()
            const filteredUsers = users.filter((user) =>
              user.name.toLowerCase().includes(searchTerm)
            )
            setFilteredUsers(filteredUsers)
          }}
        />
        <input
          type="text"
          placeholder="Input password"
          className="search-input"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
          }}
        />
      </div>
      <div className="search-container">
        <textarea
          style={{ height: 200 }}
          placeholder="custom message"
          className="search-input"
          value={textMessage}
          onChange={(e) => {
            setTextMessage(e.target.value)
          }}
        />
        <button onClick={() => {
          const cont = confirm(`are you SURE you want to send this text to ${users.length} people??\n\n${textMessage}`)
          if (cont) fetch('/api/mass_text_dangerous/any_message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              password,
              message: textMessage
            }),
          }).then(data => data.text())
            .then(data => alert("message sent:\n\n" + data))
        }}>send message</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Last Interacted At</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>
                {user.lastInteractedAt
                  ? new Date(user.lastInteractedAt).toLocaleString()
                  : 'N/A'}
              </td>
              <td>{user.score}</td>
              <td>
                <button
                  onClick={() => {
                    fetch('/api/challenge/new', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        taggedId: user.id,
                        password,
                      }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        alert(
                          `GAME STARTED\nResponse:\n${JSON.stringify(data)}`
                        )
                      })
                  }}
                >
                  Start Game
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Admin
