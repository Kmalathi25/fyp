import React, { ReactNode } from "react";
import { Noto_Sans } from "next/font/google";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "@/context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";

const notoSans = Noto_Sans({ subsets: ["latin"] });

const auth = getAuth();

export default function MainContainer({ children }: { children: ReactNode }) {
	const { user } = useAuthContext();
	const router = useRouter();

	async function onSignOut() {
		signOut(auth).catch((error) => {
			console.log(error);
			toast("Something went wrong");
		});

		toast("Signed Out");
		router.push("/");
	}

	return (
		<div className={`mx-auto max-w-4xl px-4 scroll-smooth antialiased ${notoSans}`}>
			<ToastContainer />
			<header className="flex flex-row justify-between items-center gap-4 py-4">
				<Link href={`/`} className="hover:underline font-bold">
					Water Management System
				</Link>

				<nav className="text-sm space-x-4">
					{!user && (
						<Link href={`/signin`} className="hover:underline">
							Sign In
						</Link>
					)}

					{user && (
						<Link href={`/report`} className="hover:underline">
							Reports
						</Link>
					)}

					{user && (
						<button onClick={() => onSignOut()} className="hover:underline">
							Sign Out
						</button>
					)}
				</nav>
			</header>
			{children}
		</div>
	);
}
