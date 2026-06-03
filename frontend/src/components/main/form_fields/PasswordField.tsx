import 'react';
import {type ChangeEvent, type ComponentProps, type Dispatch, type SetStateAction, useState} from "react";
import type {FormControlElement} from "../types/input.ts";
import {isPasswordValid} from "../../utils/validator.ts";
import {Form, InputGroup} from "react-bootstrap";
import InputGroupText from "react-bootstrap/cjs/InputGroupText";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";

type PasswordFieldProps = {
    passwordError?: string | null,
    setPasswordError?: Dispatch<SetStateAction<string>> | null,
    setPassword: (password: string) => void,
    password: string,
    label: string
} & ComponentProps<typeof Form.Control>

const PasswordField = ({passwordError, setPasswordError, setPassword, password, label, ...controlProps}: PasswordFieldProps) => {
    const [show, setShow] = useState(false);

    const handleInputPassword = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setPassword(input)

        if (setPasswordError) {
            if (input.trim() === "") {
                setPasswordError("Поле обязательно")
                return
            }

            if (!isPasswordValid(input)) {
                setPasswordError("Требования не выполнены")
                return
            }

            setPasswordError("")
        }
    }

    const handleShowPassword = () => {
        setShow(!show);
    }

    return (
        <div>
            <Form.Label className="field d-flex align-items-center gap-2">
                {
                    label
                }
                {
                    passwordError && (
                        <span className="small text-danger fw-normal">
                                                {
                                                    passwordError
                                                }
                                            </span>
                    )
                }
            </Form.Label>

            <InputGroup>
                <Form.Control
                    {...controlProps}
                    type={show ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={handleInputPassword}
                    onBlur={handleInputPassword}
                />

                <InputGroupText>
                    <FontAwesomeIcon icon={show ? faEye : faEyeSlash} onClick={handleShowPassword} />
                </InputGroupText>
            </InputGroup>
        </div>
    );
};

export default PasswordField;