import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";

// Expanded Field type with optional autocomplete options
type Field = {
  name: string;
  label: string;
  type?: string;
  options?: string[]; // If provided, show MUI Autocomplete with these options, otherwise mui ka autocomplete nhi hoga balkeh apka apna manually rakhna pary ga
};

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  title: string;
  fields: Field[];
  defaultValues?: Record<string, string>; // Added for pre-filling edit data
};

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  defaultValues = {}, // default empty object
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  // When modal opens or defaultValues changes, set formData accordingly
  useEffect(() => {
    if (isOpen) {
      setFormData(defaultValues);
    }
  }, [defaultValues, isOpen]);

  // Update form data on input or autocomplete change
  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Validate all fields have some value and submit
  const handleSubmit = () => {
    const isValid = fields.every((f) => formData[f.name]?.trim());
    if (isValid) {
      onSubmit(formData);
      setFormData({}); // reset form on submit
      onClose();
    } else {
      alert("Please fill in all fields.");
    }
  };

  // If modal closed, render nothing
  if (!isOpen) return null;

  // Map specific fields to their correct input types or options
  // You can extend this mapping if you want more custom logic
  const getInputType = (field: Field): string => {
    if (field.name === "phone") return "tel";
    if (field.name === "balance") return "number";
    if (field.name === "status") return "text"; // status will be dropdown via options
    return field.type || "text";
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          minWidth: 300,
          maxWidth: "90vw",
          maxHeight: "90vh",
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Typography variant="h6" mb={3}>
          {title}
        </Typography>

        <Box
          sx={{
            overflowY: "auto",
            pr: 2, // Add padding to prevent scrollbar overlap
            mb: 3,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
            "& > *": {
              minWidth: 0, // Prevent grid items from overflowing
            },
          }}
        >
          {/* agar koi component fields.options bhej raha hy to mui autocomplete work hoga, otherwise simple input */}
          {fields.map((field) =>
            field.options ? (
              <Autocomplete
                autoComplete
                key={field.name}
                options={field.options}
                value={formData[field.name] || ""}
                onInputChange={(_, newValue) => handleChange(field.name, newValue)}
                freeSolo // allows typing values outside options
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={field.label}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: "on", // disable autocomplete to avoid browser autofill
                    }}
                  />
                )}
              />
            ) : (
              <TextField
                key={field.name}
                type={getInputType(field)} // Set input type dynamically
                label={field.label}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                variant="outlined"
                margin="dense"
                fullWidth
                inputProps={{
                  autoComplete: "off",
                  inputMode:
                    field.name === "phone"
                      ? "tel"
                      : field.name === "balance"
                      ? "numeric"
                      : undefined,
                  pattern:
                    field.name === "phone"
                      ? "[0-9]*"
                      : field.name === "balance"
                      ? "[0-9]*"
                      : undefined,
                  min: field.name === "balance" ? 0 : undefined,
                }}
              />
            )
          )}
        </Box>

        <Box mt="auto" display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {title.includes("Edit") ? "Update" : "Add"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddItemModal;