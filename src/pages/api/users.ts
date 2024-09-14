import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

function score(tagging) {
  if(tagging.taggedAt){
    return Math.ceil(500 * Math.exp(-0.003 * ((tagging.taggedAt - tagging.createdAt) / 1000)));
  } else {
    return 0;
  }
}

function scoreCollection(collection){
  return collection.reduce((prev, cur) => prev + cur.score, 0)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = (await prisma.user.findMany({
    include: {
      taggings: true,
      tags: true,
    },
  })).map(user => ({
    ...user,
    taggings: user.taggings.map(tagging => ({
      ...tagging,
      score: score(tagging)
    })),
    tags: user.tags.map(tag => ({
      ...tag,
      score: score(tag)
    }))
  })).map(user => ({
     ...user,
     score: scoreCollection(user.tags) + scoreCollection(user.taggings)
  }))
  return res.json(users)
}
