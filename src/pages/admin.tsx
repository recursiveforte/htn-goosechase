import { Challenge, User } from '@prisma/client'
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

  useEffect(() => {
    fetch('/api/user/get_all')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setFilteredUsers(data)
      })
  }, [])

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Badge Code"
          className="search-input"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase()
            const filteredUsers = users.filter((user) =>
              user.badgeCode.toLowerCase().includes(searchTerm)
            )
            setFilteredUsers(filteredUsers)
          }}
        />
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Badge Code</th>
            <th>Last Interacted At</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.badgeCode}</td>
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
                         "Content-Type": "application/json",
                       },
                       body: JSON.stringify({ taggedId: user.id }),
                     })
                       .then((res) => res.json())
                       .then((data) => {
                         console.log(data)
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
