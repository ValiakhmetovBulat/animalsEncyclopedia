import 'react';
import Select, {type Props} from "react-select";
import type {StylesConfig} from "react-select";

export type DefaultOption = { value: number; label: string };

const makeSelectStyles =
    <Option, IsMulti extends boolean>(): StylesConfig<Option, IsMulti> => ({
        control: (base, state) => ({
            ...base,
            backgroundColor: "var(--bg)",
            borderColor: state.isFocused
                ? "var(--border-primary)"
                : "var(--border-primary)",

            boxShadow: "none",
            outline: "none",

            minHeight: "38px",

            "&:hover": {
                borderColor: "var(--primary)",
            },
        }),

        menu: (base) => ({
            ...base,
            backgroundColor: "var(--bg)",
            color: "var(--text)",
        }),

        menuList: (base) => ({
            ...base,
            backgroundColor: "var(--bg)",
        }),

        option: (base, state) => {
            let backgroundColor = "transparent";
            let color = "var(--text)";

            if (state.isSelected) {
                backgroundColor = "var(--primary)";
                color = "#fff";
            } else if (state.isFocused) {
                backgroundColor = "var(--primary-bg)";
                color = "var(--text-h)";
            }

            return {
                ...base,
                backgroundColor,
                color,
                cursor: "pointer",

                ":active": {
                    backgroundColor: "var(--primary-hover)",
                    color: "#fff",
                }
            };
        },

        singleValue: (base) => ({
            ...base,
            color: "var(--text-h)",
        }),

        input: (base) => ({
            ...base,
            color: "var(--text-h)",
            outline: "none",
            boxShadow: "none",
        }),

        placeholder: (base) => ({
            ...base,
            color: "var(--text)",
        }),

        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: "var(--border-primary)",
        }),

        dropdownIndicator: (base) => ({
            ...base,
            color: "var(--text)",
            "&:hover": {
                color: "var(--primary)",
            }
        }),

        clearIndicator: (base) => ({
            ...base,
            color: "var(--text)",
            "&:hover": {
                color: "var(--primary)",
            }
        }),

        multiValue: (base) => ({
            ...base,
            backgroundColor: "var(--primary-bg)",
            borderRadius: "4px",
        }),

        multiValueLabel: (base) => ({
            ...base,
            color: "var(--primary)",
            fontWeight: 500,
        }),

        multiValueRemove: (base) => ({
            ...base,
            color: "var(--primary)",
            "&:hover": {
                backgroundColor: "var(--primary)",
                color: "#fff",
            },
        }),

        noOptionsMessage: (base) => ({
            ...base,
            color: "var(--text)",
        }),
    });

type CustomSelectProps<Option = DefaultOption, IsMulti extends boolean = true> =
    Props<Option, IsMulti>;

const CustomSelect =
    <Option = DefaultOption, IsMulti extends boolean = true>
    (selectProps: CustomSelectProps<Option, IsMulti>
    ) => {

        const NoOptionsMessage = () => {
            return (
                <span>
                    Нет опций для отображения
                </span>
            )
        }

        return (
            <Select<Option, IsMulti>
                styles={makeSelectStyles<Option, IsMulti>()}
                className={"custom-select"}
                classNamePrefix={"custom-select"}
                noOptionsMessage={NoOptionsMessage}
                {...selectProps}
            />
        );
    };

export default CustomSelect;
