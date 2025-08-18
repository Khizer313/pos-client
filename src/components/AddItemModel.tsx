import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";

type Option = string | { label: string; value: string };

type Field = {
  name: string;
  label: string;
  type?: string;
  options?: Option[];
};

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  title: string;
  fields: Field[];
  defaultValues?: Record<string, string>;
};

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  defaultValues = {},
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData(defaultValues);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    }
  }, [defaultValues, isOpen]);

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    const isValid = fields.every((f) => formData[f.name]?.trim());
    if (isValid) {
      onSubmit(formData);
      setFormData({});
      onClose();
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        document.getElementById("submit-button")?.focus();
      }
    }
  };

  const getInputType = (field: Field): string => {
    if (field.name === "phone") return "tel";
    if (field.name === "balance") return "number";
    if (field.name === "status") return "text";
    return field.type || "text";
  };

  if (!isOpen) return null;

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
        }}
      >
        <Typography variant="h6" mb={3}>
          {title}
        </Typography>

        <Box
          sx={{
            overflowY: "auto",
            pr: 2,
            mb: 3,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {fields.map((field, index) =>
            field.options ? (
              Array.isArray(field.options) &&
              typeof field.options[0] === "object" ? (
                // 👉 Brand select (object mode)
                <Autocomplete<{ label: string; value: string }>
                  key={field.name}
                  options={field.options as { label: string; value: string }[]}
                  getOptionLabel={(opt) => opt.label}
                  value={
                    (field.options as { label: string; value: string }[]).find(
                      (o) => o.value === formData[field.name]
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    handleChange(field.name, newValue ? newValue.value : "")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field.label}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      inputRef={(el) => (inputRefs.current[index] = el)}
                    />
                  )}
                />
              ) : (
                // 👉 Status select (string mode)
                <Autocomplete<string>
                  key={field.name}
                  options={field.options as string[]}
                  value={formData[field.name] || ""}
                  onInputChange={(_, newValue) => handleChange(field.name, newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field.label}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      inputRef={(el) => (inputRefs.current[index] = el)}
                    />
                  )}
                />
              )
            ) : (
              // 👉 Normal text field
              <TextField
                key={field.name}
                type={getInputType(field)}
                label={field.label}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                variant="outlined"
                margin="dense"
                fullWidth
                inputRef={(el) => (inputRefs.current[index] = el)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            )
          )}
        </Box>

        <Box mt="auto" display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            id="submit-button"
          >
            {title.includes("Edit") ? "Update" : "Add"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddItemModal;
