import 'react';
import CustomTable from "./CustomTable.tsx";
import {getColoringsPaginated} from "../../api/coloring.ts";

type ColoringsTableProps = {
    refreshKey?: number;
}

const ColoringsTable = ({refreshKey = 0}: ColoringsTableProps) => {
    return (
        <CustomTable
            refreshKey={refreshKey}
            dataRequest={getColoringsPaginated}
            columns={[
                {
                    key: "id",
                    header: "№",
                    render: (c) => c.id
                },
                {
                    key: "name",
                    header: "Наименование",
                    render: (c) => c.name
                },
                {
                    key: "image_link",
                    header: "Адрес изображения",
                    render: (c) => c.image_link
                },
                {
                    key: "breed_id",
                    header: "№ породы",
                    render: (c) => c.breed_id
                }
            ]}
            getRowKey={(c) => c.id}
        />
    );
};

export default ColoringsTable;