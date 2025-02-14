import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from "../../utils/db/dummy";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "https://twitter-clone-mern-backend.vercel.app/api/posts/all";
			case "following":
				return "https://twitter-clone-mern-backend.vercel.app/api/posts/following";
			case "posts":
				return `https://twitter-clone-mern-backend.vercel.app/api/posts/user/${username}`;
			case "likes":
				return `https://twitter-clone-mern-backend.vercel.app/api/posts/${userId}`;
			default:
				return "https://twitter-clone-mern-backend.vercel.app/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT,{
					method: "GET",
					headers: {
					  "Content-Type": "application/json",
					},
					credentials: "include",
				  });
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	 // useEffect to refetch posts when feedType or username changes
	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
		{/* Display loading skeletons while data is loading or being refetched */}
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;