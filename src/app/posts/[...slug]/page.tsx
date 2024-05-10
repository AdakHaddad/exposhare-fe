"use client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Comments from "@/app/components/Comments";
import Nav from "@/app/components/Nav";
import { extractSlugFromURL } from "@/app/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import Link from "next/link"; // Import Link from Next.js

export default function Post() {
  const params = usePathname();
  const router = useRouter();
  const slug = extractSlugFromURL(params);
  const [loading, setLoading] = useState<boolean>(true);
  const [post, setPost] = useState<Post | null>(null);
  const [userData, setUserData] = useState<any>({});

  const fetchPostDetails = async (slug: string) => {
    const q = query(collection(db, "posts"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setLoading(false);
      setPost({ ...doc.data(), post_id: doc.id } as Post);
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserData(user);
        }
      });
      fetchPostDetails(slug);
    };
    checkAuth();
  }, [router, slug]);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const deletePost = async (post_id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", post_id));
      alert("Post deleted successfully");
      window.location.replace("/");
    }
  };

  return (
    <div>
      <Nav />
      <main className="w-full md:p-8 px-4">
        <header className="mb-6 py-4">
          <h2 className="text-3xl text-blue-700 font-bold mb-2">
            {post?.title}
          </h2>
          <div className="flex">
            <p className="text-red-500 mr-8 text-sm">
              Author: <span className="text-gray-700">{post?.author_name}</span>
            </p>
            <p className="text-red-500 mr-6 text-sm">
              Posted on: <span className="text-gray-700">{post?.pub_date}</span>
            </p>
          </div>
          {userData && (
            <>
              <button
                className="bg-red-500 text-white hover:bg-red-700 text-sm px-4 py-3 rounded-md mt-4 mr-4"
                onClick={() => deletePost(post?.post_id!)}
              >
                Delete Post
              </button>
              {/* Button to edit post */}
              <Link href={`/posts/edit/${post?.slug}`}>
                <button className="bg-blue-500 text-white hover:bg-blue-700 text-sm px-4 py-3 rounded-md mt-4">
                  Edit Post
                </button>
              </Link>
            </>
          )}
        </header>

        <div>
          <p className=" text-gray-700 mb-3">{post?.content}</p>
        </div>
      </main>
      <Comments comments={post?.comments} post_id={post?.post_id} />
    </div>
  );
}
