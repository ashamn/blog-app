import { Post } from "@prisma/client"
import { Context } from "../../index"
import { canUserMutatePosts } from "../../utils/canUserMutatePosts"

interface PostArgs {
  post: {
    title?: string
    content?: string
  }
}

interface PostPayloadType {
  userErrors: {
    message: string
  }[]
  post: Post | null
}

export const postResolvers = {
  postCreate: async(_: any, { post: { title, content } } : PostArgs, { prisma, userInfo }: Context) : Promise<PostPayloadType> => {

    if(!userInfo) {
      return {
        userErrors: [{
          message: "Forbidden access (unauthenticated)"
        }],
        post: null
      }
    }

    if(!title || !content)
    return {
      userErrors: [{
        message: "You must provide title and content to create a post"
      }],
      post: null
    }

    return {
      userErrors: [],
      post: await prisma.post.create({
        data: {
          title,
          content,
          authorId: userInfo.userId
        }
      })
    }
  },
  postUpdate: async(_: any, { postId, post: { post: { title, content } } } : {postId: string, post: PostArgs}, { prisma, userInfo }: Context) : Promise<PostPayloadType> => {

    if(!userInfo) {
      return {
        userErrors: [{
          message: "Forbidden access (unauthenticated)"
        }],
        post: null
      }
    }

    const error = await canUserMutatePosts({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if(error) return error

    if(!title && !content) {
      return {
        userErrors: [{
          message: "Need to have at least one field to update"
        }],
        post: null
      }
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId)
      }
    })

    if(!existingPost) {
      return {
        userErrors: [{
          message: "Post does not exist"
        }],
        post: null
      }
    }

    let payloadToUpdate = {
      title,
      content
    }

    if(!title) delete payloadToUpdate.title
    if(!content) delete payloadToUpdate.content

    return {
      userErrors: [],
      post: await prisma.post.update({
        data: {
          ...payloadToUpdate
          
        },
        where: {
          id: Number(postId)
        }
      })
    }
  },
  postDelete: async(_: any, { postId } : { postId: string}, { prisma } : Context) : Promise<PostPayloadType> => {
    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId)
      }
    })

    if(!existingPost) {
      return {
        userErrors: [{
          message: "Post does not exist"
        }],
        post: null
      }
    }

    await prisma.post.delete({
      where: {
        id: Number(postId)
      }
    })

    return {
      userErrors: [],
      post: existingPost
    }
  },
  postPublish: async(_: any, { postId } : { postId: string}, { userInfo, prisma } : Context) : Promise<PostPayloadType> => {
    if(!userInfo) {
      return {
        userErrors: [{
          message: "Forbidden access (unauthenticated)"
        }],
        post: null
      }
    }

    const error = await canUserMutatePosts({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if(error) return error

    return {
      userErrors: [],
      post: await prisma.post.update({
        where: {
          id: Number(postId)
        },
        data: {
          published: true
        }
      })
    }
  },
  postUnpublish: async(_: any, { postId } : { postId: string}, { userInfo, prisma } : Context) : Promise<PostPayloadType> => {
    if(!userInfo) {
      return {
        userErrors: [{
          message: "Forbidden access (unauthenticated)"
        }],
        post: null
      }
    }

    const error = await canUserMutatePosts({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma
    })

    if(error) return error

    return {
      userErrors: [],
      post: await prisma.post.update({
        where: {
          id: Number(postId)
        },
        data: {
          published: false
        }
      })
    }
  }
}