import MainContainer from "@/components/MainContainer";
import { useAuthContext } from "@/context/AuthContext";
import { useReportsContext } from "@/context/ReportsContext";
import firebase_app from "@/lib/firebase";
import { Report } from "@/types/common";
import { Alert, AlertTitle, Button, TextField } from "@mui/material";
import {
	addDoc,
	collection,
	doc,
	getFirestore,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	Timestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

const db = getFirestore(firebase_app);

export default function Index() {
	const { user } = useAuthContext();
	const { reports } = useReportsContext();
	const [pendingReports, setPendingReports] = useState<Report[]>([]);
	const [doneReports, setDoneReports] = useState<Report[]>([]);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		try {
			event.preventDefault();

			if (!user) {
				return toast("No user found. Please sign in.");
			}

			const formData = new FormData(event.currentTarget);
			const values: any = Object.fromEntries(formData.entries());

			await addDoc(collection(db, "reports"), {
				from_email: user?.email,
				isDone: false,
				name: user?.name,
				report: values.report,
				timestamp: serverTimestamp(),
				to_email: process.env.NEXT_PUBLIC_TO_EMAIL,
			});

			const templateParams = {
				from_name: user?.name,
				from_email: user?.email,
				message: values.report,
			};

			await emailjs.send(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, "template_9f94bol", templateParams, {
				publicKey: process.env.NEXT_PUBLIC_EMAILJS_API_KEY!,
			});

			toast("Report sent!");
		} catch (error) {
			console.log(error);
			toast("Something went wrong. Check console for more details");
		}
	}

	async function markDone(id: string, report: string) {
		try {
			const reportRef = doc(db, "reports", id);

			await updateDoc(reportRef, {
				isDone: true,
			});

			const templateParams = {
				to_name: user?.name,
				// to_email: "joshuachew8118@gmail.com",
				to_email: user?.email,
				report: report,
			};

			await emailjs.send(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, "template_ie93v44", templateParams, {
				publicKey: process.env.NEXT_PUBLIC_EMAILJS_API_KEY!,
			});

			toast("Marked as done!");
		} catch (error) {
			console.log(error);
			toast("Something went wrong. Check console for more details");
		}
	}

	function sortReports(reports: Report[]) {
		const pending: Report[] = [];
		const done: Report[] = [];

		reports.forEach((report) => {
			if (report.isDone) {
				done.push(report);
			} else {
				pending.push(report);
			}
		});

		return { pending, done };
	}

	useEffect(() => {
		if (reports) {
			const { pending, done } = sortReports(reports);
			setPendingReports(pending);
			setDoneReports(done);
		}
	}, [reports]);

	const [userReports, setUserReports] = useState<Report[] | null>(null);

	useEffect(() => {
		const reportsRef = collection(db, "reports");
		const q = query(reportsRef, orderBy("timestamp", "desc"), where("from_email", "==", user?.email));

		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const reportsArr: Report[] = [];
			querySnapshot.forEach((doc) => {
				const data: Report = doc.data() as Report;
				data.id = doc.id;

				reportsArr.push(data);
			});

			setUserReports(reportsArr);
		});

		return () => unsubscribe();
	}, []);

	return (
		<MainContainer>
			{!user && (
				<Alert severity="info">
					<AlertTitle>Sign In Required</AlertTitle>
					User can only access the dashboard after signing in.
				</Alert>
			)}

			{user && user.isManagement && (
				<div className="space-y-4">
					<section className="space-y-4">
						<h1>Pending User Reports</h1>
						{reports &&
							pendingReports.map((value, index) => (
								<div key={index} className="border rounded-md p-2 text-sm space-y-4">
									<p>
										From: {value.name} ({value.from_email})
									</p>
									<p>{value.report}</p>
									<div className="flex flex-row items-center justify-end gap-2">
										<button
											type="button"
											onClick={() => markDone(value.id, value.report)}
											className="border px-2 py-1 rounded flex flex-row gap-1 justify-center items-center hover:border-black">
											<span>Mark as done</span>
										</button>
										<a href={`mailto:${value.from_email}`} target="blank" className="border px-2 py-1 rounded hover:border-black">
											<span>Reply via email</span>
										</a>
									</div>
								</div>
							))}

						{reports && pendingReports.length === 0 && (
							<div className="border rounded-md p-2 text-sm space-y-4">
								<p>Empty</p>
							</div>
						)}
					</section>

					<section className="space-y-4">
						<h1>Done User Reports</h1>
						{reports &&
							doneReports.map((value, index) => (
								<div key={index} className="border rounded-md p-2 text-sm space-y-4">
									<p>
										From: {value.name} ({value.from_email})
									</p>
									<p>{value.report}</p>
								</div>
							))}

						{reports && doneReports.length === 0 && (
							<div className="border rounded-md p-2 text-sm space-y-4">
								<p>Empty</p>
							</div>
						)}
					</section>
				</div>
			)}

			{user && !user.isManagement && (
				<div className="space-y-4">
					<section className="space-y-4">
						<h1>Make New Report</h1>
						<form onSubmit={onSubmit} className="flex flex-col gap-4">
							<TextField
								name="report"
								id="report"
								fullWidth
								placeholder="Your report..."
								label="Report"
								multiline
								rows={2}
                required
							/>
							<Button type="submit" variant="contained">
								Submit
							</Button>
						</form>
					</section>
					<section className="space-y-4">
						<h1>Your Reports</h1>
						{userReports &&
							userReports.map((value, index) => (
								<div key={index} className="border rounded-md p-2 text-sm space-y-2">
									<p>Status: {value.isDone ? "Done" : "Pending"}</p>
									<p>{value.report}</p>
								</div>
							))}
					</section>
				</div>
			)}
		</MainContainer>
	);
}
