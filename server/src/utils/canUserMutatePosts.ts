import { Context } from ".."

interface CanUserMutatePostsParams {
  userId: number
  postId: number
  prisma: Context["prisma"]
}

export const canUserMutatePosts = async({ userId, postId, prisma }: CanUserMutatePostsParams) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if(!user) {
    return {
      userErrors: [{
        message: "User not found"
      }],
      post: null
    }
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId
    }
  })

  if(post?.authorId !== userId) {
    return {
      userErrors: [{
        message: "Post not owned by user"
      }],
      post: null
    }
  }
}