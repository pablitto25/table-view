"use client"
import * as React from "react"; 
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from "@mui/x-data-grid-generator";
import { fetchDataVtexProducts } from '@/app/utils/c_bu_get';
import { C_TC_CHILE_GET } from "@/app/utils/c_tc_chile";
import { C_TC_URUGUAY_GET } from "@/app/utils/c_tc_uruguay";

const roles = ["Market", "Finance", "Development"];
const randomRole = () => {
  return randomArrayItem(roles);
};

const adminSecret = process.env.NEXT_PUBLIC_HASURA_KEY;

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const index = randomId();
    const newRow = { index, ID: "", Fecha: "", Venta: "", isNew: true };
    setRows((oldRows) => [...oldRows, newRow]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [index]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function C_TC_URUGUAY() {
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await C_TC_URUGUAY_GET();
        const rowsWithId = data.C_TC_URUGUAY.map((row: any) => ({ ...row, index: randomId() }));
        setRows(rowsWithId);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (index: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [index]: { mode: GridRowModes.Edit } });
  };
  
  const handleSaveClick = (index: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [index]: { mode: GridRowModes.View } });
  };
  
  /* const handleDeleteClick = (index: GridRowId) => () => {
    setRows(rows.filter((row) => row.index !== index));
  }; */

  const handleDeleteClick = (index: GridRowId) => async () => {
    try {
      // Encontrar la fila correspondiente usando el índice
      const rowToDelete = rows.find((row) => row.index === index);
  
      if (!rowToDelete) {
        console.error('No se encontró la fila con el índice especificado');
        return;
      }
  
      // Obtener el ID de la fila
      const { ID } = rowToDelete;
  
      // Realizar la solicitud DELETE al endpoint correspondiente con el ID
      const response = await fetch(`https://correct-earwig-45.hasura.app/api/rest/c-bu-delete/?_eq=${ID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': `${adminSecret}`,
        },
      });
  
      if (response.ok) {
        // Eliminación exitosa, actualizar el estado de las filas
        setRows(rows.filter((row) => row.index !== index));
      } else {
        console.error('Error al eliminar la fila:', response.statusText);
      }
    } catch (error) {
      console.error('Error al procesar la eliminación de la fila:', error);
    }
  };
  
  const handleCancelClick = (index: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [index]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  
    const editedRow = rows.find((row) => row.index === index);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.index !== index));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    try {
      if (newRow.isNew) {
        // Si es una nueva fila, realizar una solicitud POST para crear un nuevo registro
        const transformedRow = {
          sucursal: newRow.Sucursal,
          vendedor: newRow.Vendedor,
          bu: newRow.BU,
          pais: newRow.Pais,
        };
  
        const response = await fetch('https://correct-earwig-45.hasura.app/api/rest/c-bu-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': `${adminSecret}`,
          },
          body: JSON.stringify(transformedRow),
        });
  
        if (response.ok) {
          const data = await response.json();
          const updatedRow = { ...newRow, isNew: false };
          // Agregar la nueva fila al estado de `rows`
          setRows(rows.map((row) => (row.index === newRow.index ? updatedRow : row)));
          return updatedRow;
        } else {
          console.error('Error al guardar la fila:', response.statusText);
        }
      } else {
        // Si no es una nueva fila, realizar una solicitud PUT para actualizar el registro existente
        const response = await fetch('https://correct-earwig-45.hasura.app/api/rest/c-bu-put', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': `${adminSecret}`,
          },
          body: JSON.stringify({
            _eq: newRow.ID, // ID de la fila que se va a actualizar
            BU: newRow.BU,
            Pais: newRow.Pais,
            Sucursal: newRow.Sucursal,
            Vendedor: newRow.Vendedor,
          }),
        });
  
        if (response.ok) {
          const updatedRow = { ...newRow, isNew: false };
          setRows(rows.map((row) => (row.index === newRow.index ? updatedRow : row)));
          return updatedRow;
        } else {
          console.error('Error al actualizar la fila:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error al procesar la actualización de la fila:', error);
      throw error; // Lanzar el error para que se maneje correctamente
    }
  };
  

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: 'index', headerName: 'INDEX', width: 80, editable: false },
    { field: 'ID', headerName: 'ID', width: 80, editable: false },
    {
      field: 'Fecha',
      headerName: 'Fecha',
      width: 150,
      /* align: 'left', */
      type: 'Date',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'Venta',
      headerName: 'Venta',
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      width: 150,
      editable: true,
    },
    /* {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    }, */
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        rows={rows}
        getRowId={(row) => row.index}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) => {
          console.error('Error al procesar la actualización de la fila:', error);
        }}
        columnVisibilityModel={{
          index: false
        }}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
}
