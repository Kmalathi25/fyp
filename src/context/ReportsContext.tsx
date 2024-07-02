import React, { FC, ReactNode, useEffect, useState } from "react";
import firebase_app from "@/lib/firebase";
import { collection, getDocs, getFirestore, query, where, QuerySnapshot, DocumentData, onSnapshot, orderBy } from "firebase/firestore";
import { Report } from "@/types/common";

const db = getFirestore(firebase_app);

interface ReportsContextProps {
	reports: Report[] | null;
	setReports: React.Dispatch<React.SetStateAction<Report[] | null>>;
}

const defaultReportsContextValue: ReportsContextProps = {
	reports: null,
	setReports: () => {},
};

export const ReportsContext = React.createContext<ReportsContextProps>(defaultReportsContextValue);

export const useReportsContext = () => React.useContext(ReportsContext);

export const ReportsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [reports, setReports] = useState<Report[] | null>(null);

	useEffect(() => {
		const reportsRef = collection(db, "reports");
		const q = query(reportsRef, orderBy("timestamp", "desc"));

		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const reportsArr: Report[] = [];
			querySnapshot.forEach((doc) => {
				const data: Report = doc.data() as Report;
				data.id = doc.id;

				reportsArr.push(data);
			});

			setReports(reportsArr);
		});

		return () => unsubscribe();
	}, []);

	return <ReportsContext.Provider value={{ reports, setReports }}>{children}</ReportsContext.Provider>;
};
