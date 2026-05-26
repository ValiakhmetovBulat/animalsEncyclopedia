import "react";
import {useEffect, useState} from "react";
import type {ReactNode} from "react";
import type {AppResponse, PaginatedResponse} from "../../api/client.ts";
import {Pagination, Table} from "react-bootstrap";
import LoadingSpinner from "../main/LoadingSpinner.tsx";

export type CustomTableColumn<T> = {
    key: string;
    header: ReactNode;
    render: (item: T) => ReactNode;
};

type CustomTableProps<T> = {
    dataRequest: (page: number, limit: number) => Promise<AppResponse<PaginatedResponse<T[]>>>;
    columns: CustomTableColumn<T>[];
    getRowKey: (item: T, index: number) => string | number;
    limit?: number;
    refreshKey?: number;
};

const CustomTable = <T,>({dataRequest, columns, getRowKey, refreshKey, limit = 5}: CustomTableProps<T>) => {
    const [data, setData] = useState<T[] | null>();
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        dataRequest(currentPage, limit).then((resp) => {
            if (!resp.ok) return;

            if (resp.data?.data) {
                setTotal(resp.data.data.total);
                setData(resp.data.data.data);
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [currentPage, dataRequest, limit, refreshKey]);

    const isPaginationItem = (index: number, totalPages: number) => {
        return (index >= currentPage - 1 && index <= currentPage + 1) || index == totalPages || index == 1;
    };

    const getPaginationItems = () => {
        const totalPages = Math.ceil(total / limit);
        const paginationItems: ReactNode[] = [];
        let isPrevEllipsis = false;

        for (let i = 1; i <= totalPages; i++) {
            if (isPaginationItem(i, totalPages)) {
                paginationItems.push(
                    <Pagination.Item key={i} onClick={() => setCurrentPage(i)} active={currentPage === i}>
                        {i}
                    </Pagination.Item>
                );
                isPrevEllipsis = false;
            } else {
                if (!isPrevEllipsis) {
                    paginationItems.push(
                        <Pagination.Ellipsis key={`ellipsis-${i}`} disabled={true}/>
                    );
                }
                isPrevEllipsis = true;
            }
        }
        return [
            <Pagination.First key={-3} onClick={() => setCurrentPage(1)}/>,
            <Pagination.Prev key={-2} onClick={() => setCurrentPage((prev) => prev - 1 ? prev - 1 : prev)}/>,
            paginationItems,
            <Pagination.Next key={-1} onClick={() => setCurrentPage((prev) => prev + 1 <= totalPages ? prev + 1 : prev)}/>,
            <Pagination.Last key={-4} onClick={() => setCurrentPage(totalPages)}/>
        ];
    };

    return (
        <div className={"mt-1 custom-table"}>
            <Table responsive striped className={"custom-table-grid"}>
                <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.key}>{column.header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: "center" }}>
                            <LoadingSpinner/>
                        </td>
                    </tr>
                ) : !data || data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: "center" }}>
                            Нет данных для отображения
                        </td>
                    </tr>
                ) : (
                    data?.map((item, index) => (
                        <tr className={"custom-table-row"} key={getRowKey(item, index)}>
                            {columns.map((column) => (
                                <td key={column.key}>{column.render(item)}</td>
                            ))}
                        </tr>
                    ))
                )}
                </tbody>
            </Table>
            <div className={"d-flex justify-content-center align-items-center"}>
                <Pagination>
                    {getPaginationItems()}
                </Pagination>
            </div>
        </div>
    );
};

export default CustomTable;
