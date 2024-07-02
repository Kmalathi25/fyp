import React, { FC, ReactNode, useEffect, useState } from "react";
import firebase_app from "@/lib/firebase";
import { collection, getDocs, getFirestore, query, where, QuerySnapshot, DocumentData, onSnapshot, orderBy } from "firebase/firestore";
import { Status } from "@/types/common";

const db = getFirestore(firebase_app);

interface StatusContextProps {
	statuses: Status[] | null;
	setStatuses: React.Dispatch<React.SetStateAction<Status[] | null>>;
}

const defaultStatusContextValue: StatusContextProps = {
	statuses: null,
	setStatuses: () => {},
};

export const StatusContext = React.createContext<StatusContextProps>(defaultStatusContextValue);

export const useStatusContext = () => React.useContext(StatusContext);

export const StatusContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [statuses, setStatuses] = useState<Status[] | null>(null);

	useEffect(() => {
		const statusRef = collection(db, "status");
		const q = query(statusRef, orderBy("timestamp", "desc"));

		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const statusArr: Status[] = [];
			querySnapshot.forEach((doc) => {
				const data: Status = doc.data() as Status;
				data.id = doc.id;

				statusArr.push(data);
			});

			setStatuses(statusArr);
		});

		return () => unsubscribe();
	}, []);

	return <StatusContext.Provider value={{ statuses, setStatuses }}>{children}</StatusContext.Provider>;
};
