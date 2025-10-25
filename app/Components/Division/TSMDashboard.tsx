"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SalesPerformance from "./TSMSection/SalesPerformance";
import OutboundCallTouchbase from "./TSMSection/OutboundCallTouchbase";
import CallsToQuote from "./TSMSection/CallstoQuote";
import QuoteToSO from "./TSMSection/QuoteToSO";
import SOToSI from "./TSMSection/SOToSI";
import CallsToSI from "./TSMSection/CallsToSI";

interface TSA {
    _id: string;
    Firstname: string;
    Lastname: string;
    ReferenceID: string;
    profilePicture?: string;
    Status?: string;
}

interface Progress {
    id?: number;
    referenceid: string;
    actualsales?: number | string;
    callstatus?: string;
    source?: string;
    activitystatus?: string;
    typeactivity?: string;
    date_created?: string;
}

interface CallRecord {
    referenceid: string;
    callstatus: string;
    source: string;
    activitystatus?: string;
    typeactivity?: string;
}

interface Card12Props {
    tsmReferenceID: string;
    dateRange: { start: string; end: string };
}

const Card12: React.FC<Card12Props> = ({ tsmReferenceID, dateRange }) => {
    const [tsaList, setTsaList] = useState<TSA[]>([]);
    const [salesMap, setSalesMap] = useState<Record<string, number>>({});
    const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const pesoFormatter = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    useEffect(() => {
        const fetchTSAAndSales = async () => {
            try {
                const resTSA = await fetch(`/api/users?tsmRef=${tsmReferenceID}`);
                if (!resTSA.ok) throw new Error("Failed to fetch TSA list");
                const dataTSA: TSA[] = await resTSA.json();

                const activeTSA = dataTSA.filter(
                    (tsa) => tsa.Status !== "Resigned" && tsa.Status !== "Terminated"
                );
                setTsaList(activeTSA);

                if (activeTSA.length === 0) {
                    setSalesMap({});
                    setCallRecords([]);
                    return;
                }

                const map: Record<string, number> = {};
                const allCallRecords: Progress[] = [];
                const start = dateRange.start ? new Date(dateRange.start) : new Date(-8640000000000000);
                const end = dateRange.end ? new Date(dateRange.end + "T23:59:59") : new Date(8640000000000000);

                await Promise.all(
                    activeTSA.map(async (tsa) => {
                        const resSales = await fetch(`/api/FetchData?referenceid=${tsa.ReferenceID}`);
                        if (!resSales.ok) throw new Error(`Failed to fetch sales for ${tsa.Firstname}`);
                        const salesResponse = await resSales.json();
                        const records: Progress[] = salesResponse.data || [];

                        const filteredRecords = records.filter((r) => {
                            if (!r.date_created) return false;
                            const date = new Date(r.date_created);
                            return date >= start && date <= end;
                        });

                        // Sum actual sales
                        const tsaTotal = filteredRecords.reduce(
                            (sum, r) => sum + (Number(r.actualsales) || 0),
                            0
                        );
                        map[tsa.ReferenceID] = Number(tsaTotal.toFixed(2));

                        // Collect outbound touchbase calls
                        allCallRecords.push(
                            ...filteredRecords.filter(
                                r => r.source === "Outbound - Touchbase" && (r.typeactivity === "Outbound calls")
                            )
                        );

                    })
                );

                setSalesMap(map);

                // Map Progress[] -> CallRecord[]
                const mappedCallRecords: CallRecord[] = allCallRecords.map(r => ({
                    referenceid: r.referenceid,
                    callstatus: r.callstatus || "",
                    source: r.source || "",
                    activitystatus: r.activitystatus || "",
                    typeactivity: r.typeactivity?.trim() || "",
                }));

                setCallRecords(mappedCallRecords);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (tsmReferenceID) fetchTSAAndSales();
    }, [tsmReferenceID, dateRange]);

    const handleViewTSA = (tsaId: string) => {
        router.push(`/form/${tsaId}`);
    };

    return (
        <div className="mb-6 space-y-6">
            <h1 className="text-3xl font-bold">TSM Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Performance Card */}
                <SalesPerformance
                    tsaList={tsaList}
                    salesMap={salesMap}
                    loading={loading}
                    pesoFormatter={pesoFormatter}
                    handleViewTSA={handleViewTSA}
                />

                {/* Outbound Touchbase Calls Card */}
                <OutboundCallTouchbase
                    tsaList={tsaList}
                    callRecords={callRecords}
                    loading={loading}
                />

                {/* Calls to Quote Card with TSA Ranking inside */}
                <CallsToQuote
                    filteredProgress={callRecords}
                    tsaList={tsaList}
                    loading={loading}
                />

                <QuoteToSO
                    filteredProgress={callRecords}
                    tsaList={tsaList}
                    loading={loading}
                />

                <SOToSI
                    filteredProgress={callRecords}
                    tsaList={tsaList}
                    loading={loading}
                />

                <CallsToSI
                    filteredProgress={callRecords}
                    tsaList={tsaList}
                />
            </div>
        </div>
    );
};

export default Card12;
