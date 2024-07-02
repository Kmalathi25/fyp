import MainContainer from "@/components/MainContainer";
import firebase_app from "@/lib/firebase";
import { Button, TextField } from "@mui/material";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import React, { FormEvent } from "react";
import { toast } from "react-toastify";

const auth = getAuth(firebase_app);

export default function Index() {
	const router = useRouter();

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const values: any = Object.fromEntries(formData.entries());

		await signInWithEmailAndPassword(auth, values.email, values.password)
			.then(() => {
				toast("Signed In");

				router.push("/");
			})
			.catch((error) => {
				console.log(error);
				toast("Something went wrong");
			});
	}

	return (
		<MainContainer>
			<h1 className="text-xl font-bold py-4">Sign In</h1>

			<form onSubmit={onSubmit} className="flex flex-col gap-4">
				<TextField name="email" id="email" label="Email" variant="outlined" required />
				<TextField name="password" id="password" label="Password" variant="outlined" required type="password" />
				<Button type="submit" variant="contained">
					Submit
				</Button>
			</form>
		</MainContainer>
	);
}
