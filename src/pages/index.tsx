import MainContainer from "@/components/MainContainer";
import { useAuthContext } from "@/context/AuthContext";
import { useStatusContext } from "@/context/StatusContext";
import { Status } from "@/types/common";
import { Alert, AlertTitle, Button } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function CustomToolbar() {
	return (
		<GridToolbarContainer>
			<GridToolbarExport />
		</GridToolbarContainer>
	);
}

export default function Home() {
	const { user } = useAuthContext();
	const { statuses } = useStatusContext();
	const [waterChartData, setWaterChartData]: any = useState();
	const [contaminationChartData, setContaminationChartData]: any = useState();
	const [tableData, setTableData]: any = useState();

	function processData(data: Status[]) {
		const waterData: any[] = [];
		const contaminationData: any[] = [];
		const table: any[] = [];

		data.forEach((item: Status) => {
			const timestamp = new Date(item.timestamp.seconds * 1000 + item.timestamp.nanoseconds / 1000000);

			if (item.water !== undefined) {
				waterData.push({ x: timestamp, y: item.water });
			}

			if (item.contamination !== undefined) {
				contaminationData.push({ x: timestamp, y: item.contamination });
			}

			table.push({
				timestamp: timestamp,
				water: item.water,
				contamination: item.contamination,
				id: item.id,
			});
		});

		return { waterData, contaminationData, table };
	}

	useEffect(() => {
		if (statuses) {
			const { waterData, contaminationData, table } = processData(statuses);
			setWaterChartData(waterData);
			setContaminationChartData(contaminationData);
			setTableData(table);
		}
	}, [statuses]);

	return (
		<MainContainer>
			{!user && (
				<Alert severity="info">
					<AlertTitle>Sign In Required</AlertTitle>
					User can only access the dashboard after signing in.
				</Alert>
			)}

			{user && (
				<main className="space-y-4">
					<section className="space-y-4">
						<h1 className="font-medium text-xl">Charts</h1>
						<div className="flex flex-col gap-4">
							<div className="border p-4 rounded">
								<h2 className="">Water Level</h2>

								<LineChart
									xAxis={[
										{
											id: "Timestamps",
											data: waterChartData ? waterChartData?.map((point: any) => point.x) : [0],
											scaleType: "time",
											valueFormatter: (date) => date.toLocaleString(),
										},
									]}
									series={[
										{
											id: "water",
											label: "Water Level",
											data: waterChartData ? waterChartData?.map((point: any) => point.y) : [0],
										},
									]}
									grid={{ vertical: true, horizontal: true }}
									height={300}
								/>
							</div>

							<div className="border p-4 rounded">
								<h2 className="">Contamination Level</h2>

								<LineChart
									xAxis={[
										{
											id: "Timestamps",
											data: contaminationChartData ? contaminationChartData?.map((point: any) => point.x) : [0],
											scaleType: "time",
											valueFormatter: (date) => date.toLocaleString(),
										},
									]}
									series={[
										{
											id: "water",
											label: "Contamination Level",
											data: contaminationChartData ? contaminationChartData?.map((point: any) => point.y) : [0],
										},
									]}
									grid={{ vertical: true, horizontal: true }}
									height={300}
								/>
							</div>
						</div>
					</section>

					<section className="space-y-4">
						<h1 className="font-medium text-xl">Full Data</h1>
						<div>
							<DataGrid
								rows={tableData ?? []}
								slots={{
									toolbar: CustomToolbar,
								}}
								columns={[
									{
										field: "timestamp",
										headerName: "Timestamp",
										width: 200,
										valueFormatter: (params) => moment(params).format("DD/MM/YYYY hh:mm A"),
									},

									{ field: "water", headerName: "Water Level", width: 150 },
									{ field: "contamination", headerName: "Contamination Level", width: 150 },
								]}
							/>
						</div>
					</section>
				</main>
			)}
		</MainContainer>
	);
}
