import  { useState, useEffect, useCallback } from "react";
import {
  Box,
  Slider,
  Typography,
  Button,
  Stack,
  Divider
} from "@mui/material";
import debounce from 'lodash-es/debounce';


const PriceRangeSlider = ({ min = 0, max = 2000, onRangeChange }) => {
  const minDistance = 10;
  const [value, setValue] = useState([min + 100, max - 100]);

  useEffect(() => {
    setValue([min + 100, max - 100]);
  }, [min, max]);

  const debouncedFilter = useCallback(
    debounce((range) => {
      if (onRangeChange) onRangeChange(range);
    }, 300),
    [onRangeChange]
  );

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;

    const newRange =
      activeThumb === 0
        ? [Math.min(newValue[0], value[1] - minDistance), value[1]]
        : [value[0], Math.max(newValue[1], value[0] + minDistance)];

    setValue(newRange);
  };

  const handleApply = () => {
    debouncedFilter(value);
  };

  const format = (v) => `$${v}`;

  return (
    <Box sx={{ px: 2, py: 3, border: "1px solid text-gray-700", borderRadius: 2 }}>
      <Divider />
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Price
      </Typography>

      <Slider
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={10}
        valueLabelDisplay="off"
        sx={{
          color: "#aaa",
          '& .MuiSlider-thumb': {
            backgroundColor: "#aaa",
            borderRadius: "50%",
          },
          '& .MuiSlider-track': {
            color: "#aaa"
          },
          '& .MuiSlider-rail': {
            color: "#ddd"
          }
        }}
      />

      <Stack direction="row" spacing={2} alignItems="center" mt={2}>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "20px",
            px: 3,
            py: 0.5,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#333"
            }
          }}
        >
          Filter
        </Button> 
          {/* //small text */}
       <Typography variant="caption" sx={{ color: "#777" }}>
  Range: ₹  {value[0]} - ${value[1]}
</Typography>

      </Stack>

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default PriceRangeSlider;
