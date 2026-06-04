import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {useMemo, useState, type Dispatch, type ReactNode, type SetStateAction} from "react";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import type {AppResponse, PaginatedResponse} from "../../api/client.ts";
import CustomTable, {type CustomTableColumn} from "./CustomTable.tsx";
import ActionButtonGroup from "./ActionButtonGroup.tsx";

type TableEntity = {
    id: number;
};

export type AddEditModalProps<T extends TableEntity> = {
    entity: T | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
};

type TablePageProps<T extends TableEntity> = {
    onDelete: (id: number) => Promise<AppResponse<unknown>>;
    dataRequest: (page: number, limit: number) => Promise<AppResponse<PaginatedResponse<T[]>>>;
    columns: CustomTableColumn<T>[];
    renderAddEditModal: (props: AddEditModalProps<T>) => ReactNode;
    deleteSuccessMessage?: string;
    getDeleteErrorMessage?: (message?: string) => string;
};

const TablePage = <T extends TableEntity,>({
    onDelete,
    dataRequest,
    columns,
    renderAddEditModal,
    deleteSuccessMessage = "Успешно",
    getDeleteErrorMessage,
}: TablePageProps<T>) => {
    const [result, setResult] = useState<ResultState<T>>({status: RESULT_STATUS.IDLE});
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [addEditEntityModalShow, setAddEditEntityModalShow] = useState<boolean>(false);
    const [entityToEdit, setEntityToEdit] = useState<T | null>(null);

    const handleAddEditEntity = (entity: T | null) => {
        setEntityToEdit(entity);
        setAddEditEntityModalShow(true);
    };

    const getErrorMessage = (message?: string) => {
        if (getDeleteErrorMessage) {
            return getDeleteErrorMessage(message);
        }

        switch (message) {
            case "param id is invalid":
                return "Неверная структура запроса";
            case "not found":
                return "Не найдено";
            default:
                return "Неизвестная ошибка";
        }
    };

    const handleDeleteEntity = (id: number) => {
        onDelete(id).then((resp) => {
            setShowAlert(true);

            if (!resp.ok) {
                const msg = getErrorMessage(resp?.data?.message);

                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Ошибка при удалении: ${msg}`,
                });

                return;
            }

            setRefreshKey(prev => prev + 1);
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: deleteSuccessMessage,
                data: null,
            });
        });
    };

    const tableColumns = useMemo<CustomTableColumn<T>[]>(() => {
        return [
            ...columns,
            {
                key: "action_buttons",
                header: "Действия",
                render: (entity) =>
                    <ActionButtonGroup
                        onEdit={() => handleAddEditEntity(entity)}
                        onDelete={() => handleDeleteEntity(entity.id)}
                    />,
            },
        ];
    }, [columns]);

    return (
        <>
            <CustomAlert
                show={showAlert}
                setShow={setShowAlert}
                result={result}
            />

            {renderAddEditModal({
                entity: entityToEdit,
                onHide: () => setAddEditEntityModalShow(false),
                show: addEditEntityModalShow,
                setRefreshKey,
            })}

            <CustomTable
                refreshKey={refreshKey}
                dataRequest={dataRequest}
                columns={tableColumns}
                getRowKey={(entity: T) => entity.id}
                onAdd={() => handleAddEditEntity(null)}
            />
        </>
    );
};

export default TablePage;
