import React from "react";
import Post from "../../components/Post/Post";
import { gql, useQuery } from "@apollo/client"

const GET_POSTS = gql`
  query {
    posts {
      title
      id
      content
      createdAt
      user {
        name
      }
    }
  }
`

export default function Posts() {
  const { data, error, loading } = useQuery(GET_POSTS)
  console.log({ data, error, loading })

  if(error)
  return <div>Error</div>;

  if(loading)
  return <div>Loading</div>

  const { posts } = data

  return <div>
    {posts.map(post => 
      <Post
        key={post.id}
        title={post.title} 
        content={post.content} 
        date={post.createdAt}
        id={post.id}
        user={post.user.name}
      >
      </Post>)}
  </div>

  return <div></div>;
}
