import { Context } from "..";
import { userLoader } from "../loaders/userLoader";


interface PostParentType {
  authorId: number
}

export const Post = {
  user: ({ authorId } : PostParentType, __: any, { prisma }: Context) => {
    // return prisma.user.findUnique({
    //   where: {
    //     id: authorId
    //   }
    // })
    return userLoader.load(authorId)
  },
}
