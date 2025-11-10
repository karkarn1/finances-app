import { FC, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  fetchCurrencies,
  selectActiveCurrencies,
  selectCurrenciesLoading,
  selectCurrenciesError,
} from '@/store/slices/currenciesSlice';
import type { Currency } from '@/types';

interface CurrencySelectorProps {
  value: string | null;
  onChange: (code: string | null) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

const CurrencySelector: FC<CurrencySelectorProps> = ({
  value,
  onChange,
  label = 'Currency',
  disabled = false,
  error = false,
  helperText,
  required = false,
}) => {
  const dispatch = useAppDispatch();
  const currencies = useAppSelector(selectActiveCurrencies);
  const loading = useAppSelector(selectCurrenciesLoading);
  const apiError = useAppSelector(selectCurrenciesError);

  // Fetch currencies on mount if not already loaded
  useEffect(() => {
    if (currencies.length === 0 && !loading) {
      void dispatch(fetchCurrencies(true));
    }
  }, [dispatch, currencies.length, loading]);

  // Find the selected currency object
  const selectedCurrency = currencies.find((c) => c.code === value) || null;

  const handleChange = (_event: React.SyntheticEvent, newValue: Currency | null) => {
    onChange(newValue ? newValue.code : null);
  };

  return (
    <Autocomplete
      value={selectedCurrency}
      onChange={handleChange}
      options={currencies}
      getOptionLabel={(option) => `${option.code} - ${option.name} (${option.symbol})`}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...(params as object)}
          label={label}
          required={required}
          error={error || Boolean(apiError)}
          helperText={helperText !== undefined ? helperText : (apiError !== null ? `Error: ${apiError}` : undefined)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          data-testid="currency-selector"
        />
      )}
    />
  );
};

export default CurrencySelector;
