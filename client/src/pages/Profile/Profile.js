import React from "react";
import { useParams } from "react-router";
import AddPostModal from "../../components/AddPostModal/AddPostModal";
import Post from "../../components/Post/Post";
import { gql, useQuery } from "@apollo/client"

const GET_PROFILE = gql`
  query GetProfile($userId: ID!){
    profile(userId: $userId) {
      bio
      user {
        id
        name
        posts {
          id
          title
          content
          createdAt
        }
      }
    }
  }
`

export default function Profile() {
  const { id } = useParams();
  const { data, error, loading } = useQuery(GET_PROFILE, {
    variables: {
      userId: id
    }
  })
  console.log({ data, error, loading })

  if(error)
  return <div>Error</div>;

  if(loading)
  return <div>Loading</div>

  const { profile } = data
  console.log('profile :>> ', profile);

  return (
    <div>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex ",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>{ profile.user.name }</h1>
          <p>{ profile.bio }</p>
        </div>
        <div>{"profile" ? <AddPostModal /> : null}</div>
      </div>
      <div>
        { profile.user.posts.map(post => {
          return <Post
            key={post.id}
            title={post.title} 
            content={post.content} 
            date={post.createdAt}
            id={post.id}
            user={profile.user.name}
          ></Post>
        }) }
      </div>
    </div>
  );
}
