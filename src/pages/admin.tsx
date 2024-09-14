import { Challenge, User } from '@prisma/client'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {}

type FullUser = User & {
  score: number
  taggings: Challenge[]
  tags: Challenge[]
}

const Admin = (props: Props) => {
  const [users, setUsers] = useState<FullUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<FullUser[]>([])
  const [roomName, setRoomName] = useState('the food tent')
  const query = useSearchParams()

  useEffect(() => {
    if (query.get('password') !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) return

    fetch('/api/user/get_all')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setFilteredUsers(data)
      })
  }, [query])

  if (
    !query.get('password') ||
    query.get('password') !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  )
    return <div>Invalid password</div>

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
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Room Name"
          className="search-input"
          onChange={(e) => {
            setRoomName(e.target.value)
          }}
        />
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
                        roomName,
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
