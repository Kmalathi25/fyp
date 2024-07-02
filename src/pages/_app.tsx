import { AuthContextProvider } from "@/context/AuthContext";
import { ReportsContextProvider } from "@/context/ReportsContext";
import { StatusContextProvider } from "@/context/StatusContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AuthContextProvider>
			<StatusContextProvider>
				<ReportsContextProvider>
					<Component {...pageProps} />
				</ReportsContextProvider>
			</StatusContextProvider>
		</AuthContextProvider>
	);
}
