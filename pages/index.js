import React,{ useEffect } from "react";
import { GoSignOut } from "react-icons/go";
import { useAuth } from "@/firebase/auth";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import axios from "axios";

export default function Home() {
  const { authUser, isLoading, signOut } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!authUser && !isLoading) {
      router.push("/login");
    }
  }, [authUser, isLoading]);
  return !authUser ? (
    <Loader />
  ) : (
    <main className="">
      <div onClick={signOut} className="bg-black text-white w-44 py-4 mt-10 rounded-lg transition-transform hover:bg-black/[0.8] active:scale-90 flex items-center justify-center gap-2 font-medium shadow-md fixed bottom-5 right-5 cursor-pointer">
        <GoSignOut size={18} />
        <span>Logout</span>
      </div>
      Home
    </main>
  );
}
