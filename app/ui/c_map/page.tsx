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
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { C_MAP_GET } from "@/app/utils/c_map";



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
    const newRow = { index, ID: "", Cuenta: '', Descripcion: "", Rubro: "",  Paquete_Gastos: "", isNew: true };
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

export default function C_MAP() {
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await C_MAP_GET();
        const rowsWithId = data.C_MAP.map((row: any) => ({ ...row, index: randomId() }));
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
      const response = await fetch(`https://correct-earwig-45.hasura.app/api/rest/c-map-delete/?_eq=${ID}`, {
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
          Cuenta: newRow.Cuenta,
          Descripcion: newRow.Descripcion,
          Rubro: newRow.Rubro,
          Paquete_Gastos: newRow.Paquete_Gastos,
        };
        console.log(transformedRow);
        console.log(newRow);
        const response = await fetch('https://correct-earwig-45.hasura.app/api/rest/c-map-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': `${adminSecret}`,
          },
          body: JSON.stringify(transformedRow),
        });
  
        if (response.ok) {
          /* const data = await response.json(); */
          const updatedRow = { ...newRow, isNew: false };
          // Agregar la nueva fila al estado de `rows`
          setRows(rows.map((row) => (row.index === newRow.index ? updatedRow : row)));
          return updatedRow;
        } else {
          console.error('Error al guardar la fila:', response.statusText);
        }
      } else {
        // Si no es una nueva fila, realizar una solicitud PUT para actualizar el registro existente
        const response = await fetch('https://correct-earwig-45.hasura.app/api/rest/c-map-put', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': `${adminSecret}`,
          },
          body: JSON.stringify({
            _eq: newRow.ID, // ID de la fila que se va a actualizar
            Cuenta: newRow.Cuenta,
            Descripcion: newRow.Descripcion,
            Rubro: newRow.Rubro,
            Paquete_Gastos: newRow.Paquete_Gastos,
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
    { field: 'ID', headerName: 'ID', width: 20, editable: false },
    {
      field: 'Cuenta',
      headerName: 'Cuenta',
      type: 'number',
      width: 80,
      editable: true,
      valueFormatter: (params: GridValueFormatterParams) => {
        // Verificar si params.value es un número antes de formatearlo
        if (typeof params.value === 'number') {
          return params.value.toFixed(0);
        } else {
          return ''; // O cualquier otro valor que desees mostrar si no es un número
        }
      }
    },
    {
      field: 'Descripcion',
      headerName: 'Descripcion',
      width: 350,
      editable: true,
    },
    {
      field: 'Rubro',
      headerName: 'Rubro',
      width: 120,
      editable: true,
    },
    {
      field: 'Paquete_Gastos',
      headerName: 'Paquete Gastos',
      width: 250,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
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
    },
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
