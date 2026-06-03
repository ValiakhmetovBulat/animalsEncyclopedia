import 'react';
import {Alert} from "react-bootstrap";
import {type Dispatch, type SetStateAction, useEffect} from "react";
import {RESULT_STATUS, type ResultState, type ResultStatus} from "../../api/result.ts";
import type {Variant} from "react-bootstrap/cjs/types";

type CustomAlertProps<T> = {
    show: boolean,
    setShow:  Dispatch<SetStateAction<boolean>>,
    result: ResultState<T>,
    heading?: string,
    autoHideMs?: number,
}

const CustomAlert = <T,>({
                             show,
                             setShow,
                             result,
                             autoHideMs = 5000,
                         }: CustomAlertProps<T>) => {
    useEffect(() => {
        if (!show) {
            return;
        }
        const timerId = window.setTimeout(() => setShow(false), autoHideMs);
        return () => window.clearTimeout(timerId);
    }, [show, setShow, autoHideMs])

    const getVariant = (status: ResultStatus): Variant => {
        switch (status) {
            case RESULT_STATUS.SUCCESS:
                return 'success';
            case RESULT_STATUS.ERROR:
                return 'danger';
            case RESULT_STATUS.IDLE:
                return 'info';
            case RESULT_STATUS.LOADING:
                return 'warning';
        }
    }

    const getHeading = (status: ResultStatus) => {
        switch (status) {
            case RESULT_STATUS.SUCCESS:
                return 'Успешно';
            case RESULT_STATUS.ERROR:
                return 'Ошибка';
            case RESULT_STATUS.IDLE:
                return 'Ожидание';
            case RESULT_STATUS.LOADING:
                return 'Загрузка...';
        }
    }

    return (
        <>
            <Alert className="custom-alert" variant={getVariant(result.status)} onClose={() => setShow(false)} dismissible={true} show={show}>
                <Alert.Heading className={"fs-5"}>{getHeading(result.status)}</Alert.Heading>
                {
                    result?.message && (
                        <p>
                            {result.message}
                        </p>
                    )
                }
            </Alert>
        </>
    );
};

export default CustomAlert;
