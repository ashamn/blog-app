import { Context } from "..";

interface UserParentType {
  id: number
}

export const User = {
  posts: ({ id } : UserParentType, __: any, { userInfo, prisma }: Context) => {
    const isOwnProfile = id === userInfo?.userId

    if(isOwnProfile) {
      return prisma.post.findMany({
        where: {
          authorId: id
        },
        orderBy: [{
          createdAt: "desc"
        }]
      })
    }

    return prisma.post.findMany({
      where: {
        authorId: id,
        published: true
      },
      orderBy: [{
        createdAt: "desc"
      }]
    })
  },
}
