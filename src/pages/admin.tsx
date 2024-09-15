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

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json())

const Admin = (props: Props) => {
  const { data: users, error, isLoading } = useSWR('/api/user/get_all', fetcher)
  const [filteredUsers, setFilteredUsers] = useState<FullUser[]>([])
  const [password, setPassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    setFilteredUsers(users)
  }, [users])

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
                        password
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
