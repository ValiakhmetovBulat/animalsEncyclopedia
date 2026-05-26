import 'react';
import {useAuth} from "../stores/AuthStore.ts";
import {useNavigate} from "react-router-dom";
import {type ComponentProps, useState} from "react";
import type {LoginData} from "../../api/auth.ts";
import {type ResultState, RESULT_STATUS} from "../../api/result.ts";
import {ADMIN_PAGE_ROUTE} from "../main/routing/routesConsts.ts";
import CustomAlert from "../main/CustomAlert.tsx";
import UsernameField from "../main/form_fields/UsernameField.tsx";
import PasswordField from "../main/form_fields/PasswordField.tsx";
import {Form} from "react-bootstrap";

type FormState = {
    username: string
    password: string
}

const initialForm: FormState = {
    username: '',
    password: '',
}

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const {loginUser} = useAuth();

    const [form, setForm] = useState<FormState>(initialForm)
    const [result, setResult] = useState<ResultState<LoginData>>({ status: RESULT_STATUS.IDLE })
    const [show, setShow] = useState<boolean>(false);

    const onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
        event.preventDefault()
        setShow(true);
        const trimmedUsername = form.username.trim()
        const trimmedPassword = form.password.trim()

        if (!trimmedUsername || !trimmedPassword) {
            setResult({
                status: RESULT_STATUS.ERROR,
                message: 'Введите имя пользователя и пароль.',
            })
            return
        }

        setResult({ status: RESULT_STATUS.LOADING })

        const response = await loginUser({
            username: trimmedUsername,
            password: trimmedPassword,
        })

        if (!response.ok) {
            let msg: string

            switch (response.status) {
                case 400:
                    msg = "Неверный формат запроса"
                    break;
                case 401:
                    msg = "Неверное имя пользователя или пароль"
                    break;
                case 429:
                    msg = "Слишком много запросов. Повторите попытку позже"
                    break;
                default:
                    msg = "Неизвестная ошибка"
                    break;
            }

            setResult({
                status: RESULT_STATUS.ERROR,
                message: msg,
            })
            return
        }

        const responseMessage = response.data?.message?.trim()

        setResult({
            status: RESULT_STATUS.SUCCESS,
            message: responseMessage || 'Вход выполнен успешно.',
            data: response.data,
        })

        navigate(ADMIN_PAGE_ROUTE)
    }

    const isBusy = result.status === 'loading'

    return (
        <>
            <CustomAlert
                show={show}
                setShow={setShow}
                result={result}
            />

            <main className="auth-shell">
                <section className="auth-card">
                    <div className="auth-header">
                        <h1>Вход в систему</h1>
                        <p className="auth-subtitle">
                            Используйте свои учетные данные, чтобы продолжить работу.
                        </p>
                    </div>

                    <Form className="auth-form" onSubmit={onSubmit}>
                        <UsernameField
                            name="username"
                            autoComplete="username"
                            setUsername={(username) =>
                                setForm((prev) => ({ ...prev, username: username }))
                            }
                            username={form.username}
                        />

                        <PasswordField
                            label={"Пароль"}
                            password={form.password}
                            name="password"
                            autoComplete="password"
                            setPassword={(password) =>
                                setForm((prev) => ({ ...prev, password:password }))
                            }
                        />

                        <button className="button-custom mt-2" type="submit" disabled={isBusy}>
                            {isBusy ? 'Отправка...' : 'Войти'}
                        </button>
                    </Form>

                    <div className="auth-footer">
                        <p>Copyright © 2026 Валиахметов Б.М., гр. 4383</p>
                    </div>
                </section>
            </main>
        </>
    );
};

export default AdminLoginPage;