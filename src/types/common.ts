import { Timestamp } from "firebase/firestore";

export type User = {
	uid: string;
	name: string;
	email: string;
	isManagement: boolean;
};

export type Status = {
	id: string;
	contamination: number;
	water: number;
	timestamp: Timestamp;
};

export type Report = {
	id: string;
	name: string;
	report: string;
	from_email: string;
	to_email: string;
	timestamp: Timestamp;
	isDone: boolean;
};
