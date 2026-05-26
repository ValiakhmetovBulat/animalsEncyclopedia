import 'react';
import type {ChangeEvent, ComponentProps, Dispatch, SetStateAction} from "react";
import type {FormControlElement} from "../types/input.ts";
import {Form} from "react-bootstrap";
import {isUsernameValid} from "../../utils/validator.ts";

type UsernameFieldProps = {
    usernameError?: string | null,
    setUsernameError?: Dispatch<SetStateAction<string>> | null,
    setUsername: (username: string) => void,
    username: string
} & ComponentProps<typeof Form.Control>

const UsernameField = ({usernameError, setUsernameError, setUsername, username, ...fieldProps}: UsernameFieldProps) => {
    const handleInputUsername = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setUsername(input)

        if (setUsernameError) {
            if (input.trim() === "") {
                setUsernameError("Поле «Логин» обязательно")
                return
            }

            if (!isUsernameValid(input)) {
                setUsernameError("Неверный формат")
                return
            }

            setUsernameError("")
        }
    }

    return (
        <Form.Group>
            <Form.Label className="field d-flex align-items-center gap-2">
                Логин
                {
                    usernameError && (
                        <span className="small text-danger fw-normal">
                                                {
                                                    usernameError
                                                }
                                            </span>
                    )
                }
            </Form.Label>

            <Form.Control
                {...fieldProps}
                isInvalid={usernameError ? usernameError.length > 0 : false}
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => handleInputUsername(e)}
                onBlur={e=> handleInputUsername(e)}
                placeholder="Ivanov.Ivan"
            />
        </Form.Group>
    );
};

export default UsernameField;