import  'react';
import {Button} from "react-bootstrap";
import {faCheck, faCopy, faPencil, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useState} from "react";
import type {DeleteStatus} from "../main/types/input.ts";

type ActionButtonProps = {
    onDelete?: (() => void) | null;
    onEdit?: (() => void) | null;
    onCopy?: (() => void) | null;
}

const ActionButtonGroup = ({onDelete = null, onEdit = null, onCopy}: ActionButtonProps) => {
    const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>("restricted");
    const [deleteLoadingLeft, setDeleteLoadingLeft] = useState(3);

    const handleRequestDeletion = () => {
        setDeleteStatus("loading")

        let counter = deleteLoadingLeft;

        const interval = setInterval(() => {
            counter -= 1;
            setDeleteLoadingLeft(counter);

            if (counter <= 0) {
                clearInterval(interval);
                setDeleteStatus("allowed");
            }
        }, 1000);
    }

    const handleDelete = () => {
        setDeleteStatus("restricted");
        setDeleteLoadingLeft(3);

        if (onDelete) {
            onDelete();
        }
    }

    return (
        <div className={"action-button-group"}>
            {
                onEdit ? (
                    <Button onClick={onEdit} className={"button-custom-edit"}>
                        <FontAwesomeIcon icon={faPencil} />
                    </Button>
                ) : (
                    <></>
                )
            }
            {
                onCopy ? (
                    <Button onClick={onCopy} className={"button-custom-cancel"}>
                        <FontAwesomeIcon icon={faCopy} />
                    </Button>
                ) : (
                    <></>
                )
            }
            {
                onDelete ? (
                    <Button
                        disabled={deleteStatus === "loading"}
                        aria-readonly={deleteStatus === "loading"}
                        onClick={
                            deleteStatus === "allowed" ?
                                handleDelete :
                                deleteStatus === "restricted" ?
                                    handleRequestDeletion
                                    :
                                    () => { }
                        }
                        className={"button-custom-delete"}
                    >
                        {
                            deleteStatus === "allowed" ?
                                <FontAwesomeIcon icon={faCheck}/> :
                                deleteStatus === "loading" ?
                                    `${deleteLoadingLeft}с` :
                                    <FontAwesomeIcon icon={faTrash}/>
                        }
                    </Button>
                ) : (
                    <></>
                )
            }
        </div>
    );
};

export default ActionButtonGroup;