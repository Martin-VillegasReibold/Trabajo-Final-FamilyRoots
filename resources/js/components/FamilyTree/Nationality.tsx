import React, { useState, useEffect } from 'react';
import { GetCountries } from 'react-country-state-city/dist/esm/index';
import CustomSelect from './CustomSelect';
import 'react-country-state-city/dist/react-country-state-city.css';
import type { MultiValue, SingleValue } from 'react-select';

export interface NationalityValue {
  countries: string[];
}

interface NationalityProps {
  value: NationalityValue;
  onChange: (value: NationalityValue) => void;
  label?: string;
}

type CountryType = { id: number; name: string; iso2: string };

const Nationality: React.FC<NationalityProps> = ({ value, onChange, label }) => {
  const [countries, setCountries] = useState<CountryType[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryType[]>([]);

  useEffect(() => {
    GetCountries().then((data) => setCountries(data as CountryType[]));
  }, []);

  useEffect(() => {
    // Sincroniza el estado local con el valor recibido por props
    if (value.countries && countries.length > 0) {
      const found = value.countries
        .map((name) => countries.find((c) => c.name === name))
        .filter(Boolean) as CountryType[];
      setSelectedCountries(found);
    }
  }, [value, countries]);

  const handleChange = (
    newValue: MultiValue<CountryType> | SingleValue<CountryType>
  ) => {
    const arr = Array.isArray(newValue) ? (newValue as CountryType[]) : [];
    setSelectedCountries(arr);
    onChange({ countries: arr.map((c) => c.name) });
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <CustomSelect<CountryType>
        options={countries}
        getOptionLabel={(option) => option.name}
        formatOptionLabel={(option: CountryType) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <img
              src={`https://flagcdn.com/24x18/${option.iso2.toLowerCase()}.png`}
              alt={option.name}
              style={{ width: '24px', height: '18px', borderRadius: '2px', boxShadow: '0 0 2px #0002' }}
              loading="lazy"
            />
            {option.name}
          </span>
        )}
        getOptionValue={(option) => String(option.id)}
        value={selectedCountries}
        onChange={handleChange}
        isMulti
        isClearable
        placeholder="Selecciona uno o más países..."
        classNamePrefix="custom-select"
      />
    </div>
  );
};

export default Nationality;
