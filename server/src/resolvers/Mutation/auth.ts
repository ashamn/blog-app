import { Context } from "../../index"
import validator from "validator"
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { JWT_SIGNATURE } from "../keys"

interface SignupArgs {
  credentials: {
    email: string
    password: string
  }
  name: string
  bio: string
}

interface UserPayload {
  userErrors: {
    message: string
  }[]
  token: string | null
}

export const authResolvers = {
  signup: async(_: any, { name, bio, credentials: { email, password }} : SignupArgs, { prisma }: Context) : Promise<UserPayload> => {

    const isEmail = validator.isEmail(email)

    if(!isEmail) {
      return {
        userErrors: [{
          message: "Invalid email"
        }],
        token: null
      }
    }

    const isValidPassword = validator.isLength(password, {
      min: 5
    })

    if(!isValidPassword) {
      return {
        userErrors: [{
          message: "Invalid password"
        }],
        token: null
      }
    }

    if(!name || !bio) {
      return {
        userErrors: [{
          message: "Invalid name or bio"
        }],
        token: null
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    })

    await prisma.profile.create({
      data: {
        bio,
        userId: user.id
      }
    })

    const token = await JWT.sign({
      userId: user.id
    }, JWT_SIGNATURE, {
      expiresIn: 360000000
    })

    return {
      userErrors: [],
      token
    }
  },
  signin: async(_: any, { credentials: { email, password }} : Pick<SignupArgs, "credentials">, { prisma }: Context): Promise<UserPayload> => {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if(!user) {
      return {
        userErrors: [{
          message: "Invalid credentials"
        }],
        token: null
      }
    }

    const isMatch = user.password && bcrypt.compare(password, user.password)

    if(!isMatch) {
      return {
        userErrors: [{
          message: "Invalid credentials"
        }],
        token: null
      }
    }

    return {
      userErrors: [],
      token: JWT.sign({
        userId: user.id
      }, JWT_SIGNATURE, {
        expiresIn: 360000000
      })
    }
  }
}